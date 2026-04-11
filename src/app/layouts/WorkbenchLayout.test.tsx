import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, test, vi } from 'vitest'

const setActivePanelMock = vi.fn<(panel: 'explorer' | 'history') => void>()
const setSidePanelOpenMock = vi.fn<(isOpen: boolean) => void>()
const setSidePanelWidthMock = vi.fn<(width: number) => void>()
const rehydrateSidePanelWidthMock = vi.fn<() => void>()

const workbenchState = {
	activeDocumentId: 'doc-1',
	documentTitle: '测试文档',
	isWorkbenchReady: true,
	saveStatus: 'saved' as const,
	activePanel: 'explorer' as const,
	sidePanelWidth: 256,
	tabs: [],
	activeTabId: 'doc-1',
	isSidePanelOpen: true,
	isRightPanelOpen: false,
	setSidePanelWidth: setSidePanelWidthMock,
	rehydrateSidePanelWidth: rehydrateSidePanelWidthMock,
	setSidePanelOpen: setSidePanelOpenMock,
	setRightPanelOpen: vi.fn<(isOpen: boolean) => void>(),
	activateDocumentTab: vi.fn<(documentId: string) => void>(),
	closeDocumentTab: vi.fn<(documentId: string) => string | null>(() => null),
}

vi.mock('@/app/chrome', () => ({
	WindowChrome: () => <div data-testid='window-chrome-stub'>窗口顶栏</div>,
	WindowChromeBrandHeader: () => <div data-testid='window-chrome-brand-header-stub'>品牌头</div>,
}))

vi.mock('@/features/documents', () => ({
	useDocumentStore: (selector: (state: { setSelectedDocumentId: (documentId: string | null) => void }) => unknown) =>
		selector({
			setSelectedDocumentId: vi.fn<(documentId: string | null) => void>(),
		}),
}))

vi.mock('@/features/workspace/state', () => ({
	useWorkspaceStore: (selector: (state: { documents: [] }) => unknown) =>
		selector({
			documents: [],
		}),
}))

vi.mock('@/shared/ui', async () => {
	const actual = await vi.importActual<typeof import('@/shared/ui')>('@/shared/ui')

	return {
		...actual,
		ResizablePanelGroup: ({ children }: { children: ReactNode }) => (
			<div data-testid='resizable-group-stub'>{children}</div>
		),
		ResizablePanel: ({ children }: { children: ReactNode }) => <div data-testid='resizable-panel-stub'>{children}</div>,
		ResizableHandle: () => <div data-testid='resizable-handle-stub' />,
	}
})

vi.mock('@/features/workbench', () => ({
	WORKBENCH_ACTIVITY_BAR_WIDTH: 56,
	WORKBENCH_SIDE_PANEL_DEFAULT_WIDTH: 256,
	WORKBENCH_SIDE_PANEL_MAX_WIDTH: 420,
	WORKBENCH_SIDE_PANEL_MIN_WIDTH: 240,
	ActivityBar: ({ onPanelChange }: { onPanelChange: (panel: 'explorer' | 'history') => void }) => (
		<div>
			<button
				type='button'
				onClick={() => {
					onPanelChange('explorer')
				}}>
				切换资源
			</button>
			<button
				type='button'
				onClick={() => {
					onPanelChange('history')
				}}>
				切换历史
			</button>
		</div>
	),
	ExplorerPanel: () => <div>资源面板</div>,
	HistoryPanel: () => <div>历史面板</div>,
	WorkbenchMetaRail: ({ children }: { children: ReactNode }) => <div data-testid='meta-rail-stub'>{children}</div>,
	WorkbenchResizableShell: ({ sidebar, main }: { sidebar: ReactNode; main: ReactNode }) => (
		<div data-testid='resizable-shell-stub'>
			{sidebar}
			{main}
		</div>
	),
	WorkbenchShellFrame: ({
		header,
		canvas,
		metaRail,
	}: {
		header: ReactNode
		canvas: ReactNode
		metaRail?: ReactNode
	}) => (
		<div data-testid='workbench-shell-frame-stub'>
			{header}
			{canvas}
			{metaRail}
		</div>
	),
	WorkbenchSidePanel: ({ children }: { children: ReactNode }) => <div data-testid='side-panel-stub'>{children}</div>,
	RightPanel: () => <div data-testid='right-panel-stub'>右侧栏</div>,
	StatusBar: () => <div>状态栏</div>,
	WorkbenchShellProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
	WorkbenchTabs: () => <div>标签栏</div>,
	useWorkbenchShell: () => ({
		shellState: {
			onBack: vi.fn<() => void>(),
			onSave: vi.fn<() => void>(),
			onCreateVersion: vi.fn<() => Promise<null>>(),
		},
		setActivePanel: setActivePanelMock,
	}),
	useWorkbenchStore: (selector: (state: typeof workbenchState) => unknown) => selector(workbenchState),
}))

describe('WorkbenchLayout', () => {
	test('再次点击当前面板时应折叠侧栏', async () => {
		const user = userEvent.setup()
		setActivePanelMock.mockReset()
		setSidePanelOpenMock.mockReset()
		setSidePanelWidthMock.mockReset()
		rehydrateSidePanelWidthMock.mockReset()
		const { default: WorkbenchLayout } = await import('./WorkbenchLayout')

		render(
			<MemoryRouter initialEntries={['/workbench?documentId=doc-1']}>
				<WorkbenchLayout />
			</MemoryRouter>,
		)

		await user.click(screen.getByRole('button', { name: '切换资源' }))

		expect(setSidePanelOpenMock).toHaveBeenCalledWith(false)
		expect(setActivePanelMock).not.toHaveBeenCalled()
	})

	test('点击其他面板时应切换并展开侧栏', async () => {
		const user = userEvent.setup()
		setActivePanelMock.mockReset()
		setSidePanelOpenMock.mockReset()
		setSidePanelWidthMock.mockReset()
		rehydrateSidePanelWidthMock.mockReset()
		const { default: WorkbenchLayout } = await import('./WorkbenchLayout')

		render(
			<MemoryRouter initialEntries={['/workbench?documentId=doc-1']}>
				<WorkbenchLayout />
			</MemoryRouter>,
		)

		await user.click(screen.getByRole('button', { name: '切换历史' }))

		expect(setActivePanelMock).toHaveBeenCalledWith('history')
		expect(setSidePanelOpenMock).toHaveBeenCalledWith(true)
	})

	test('workbench 应在整页顶部渲染窗口顶栏', async () => {
		setActivePanelMock.mockReset()
		setSidePanelOpenMock.mockReset()
		setSidePanelWidthMock.mockReset()
		rehydrateSidePanelWidthMock.mockReset()
		const { default: WorkbenchLayout } = await import('./WorkbenchLayout')

		render(
			<MemoryRouter initialEntries={['/workbench?documentId=doc-1']}>
				<WorkbenchLayout />
			</MemoryRouter>,
		)

		expect(screen.getByTestId('window-chrome-brand-header-stub')).toBeInTheDocument()
		expect(screen.getByTestId('window-chrome-stub')).toBeInTheDocument()
		expect(screen.getByTestId('workbench-shell-frame-stub')).toBeInTheDocument()
		expect(screen.getByTestId('side-panel-stub')).toBeInTheDocument()
	})

	test('右侧栏默认应保持收起', async () => {
		setActivePanelMock.mockReset()
		setSidePanelOpenMock.mockReset()
		setSidePanelWidthMock.mockReset()
		rehydrateSidePanelWidthMock.mockReset()
		const { default: WorkbenchLayout } = await import('./WorkbenchLayout')

		render(
			<MemoryRouter initialEntries={['/workbench?documentId=doc-1']}>
				<WorkbenchLayout />
			</MemoryRouter>,
		)

		expect(screen.queryByTestId('right-panel-stub')).not.toBeInTheDocument()
	})

	test('侧栏收起时仍应保留 workbench 主框架', async () => {
		workbenchState.isSidePanelOpen = false
		setActivePanelMock.mockReset()
		setSidePanelOpenMock.mockReset()
		setSidePanelWidthMock.mockReset()
		rehydrateSidePanelWidthMock.mockReset()
		const { default: WorkbenchLayout } = await import('./WorkbenchLayout')

		render(
			<MemoryRouter initialEntries={['/workbench?documentId=doc-1']}>
				<WorkbenchLayout />
			</MemoryRouter>,
		)

		expect(screen.getByTestId('workbench-shell-frame-stub')).toBeInTheDocument()
		expect(screen.getByTestId('resizable-shell-stub')).toBeInTheDocument()
		expect(screen.queryByTestId('side-panel-stub')).not.toBeInTheDocument()

		workbenchState.isSidePanelOpen = true
	})
})
