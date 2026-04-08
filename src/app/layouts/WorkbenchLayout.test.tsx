import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, test, vi } from 'vitest'

const workbenchState = {
	activeDocumentId: 'doc-1',
	documentTitle: '测试文档',
	isWorkbenchReady: true,
	saveStatus: 'saved' as const,
	isFlushing: false,
	activePanel: 'explorer' as const,
	tabs: [],
	activeTabId: 'doc-1',
	isSidePanelOpen: true,
	isRightPanelOpen: false,
	setRightPanelOpen: vi.fn<(isOpen: boolean) => void>(),
	activateDocumentTab: vi.fn<(documentId: string) => void>(),
	closeDocumentTab: vi.fn<(documentId: string) => string | null>(() => null),
}

vi.mock('@/app/chrome', () => ({
	WindowChrome: () => <div data-testid='window-chrome-stub'>窗口顶栏</div>,
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

vi.mock('@/features/workbench', () => ({
	ActivityBar: () => <div>活动栏</div>,
	ExplorerPanel: () => <div>资源面板</div>,
	HistoryPanel: () => <div>历史面板</div>,
	RightPanel: () => <div data-testid='right-panel-stub'>右侧栏</div>,
	StatusBar: () => <div>状态栏</div>,
	WorkbenchShellProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
	WorkbenchTabs: () => <div>标签栏</div>,
	WorkbenchTitleBar: () => <div>标题栏</div>,
	useWorkbenchShell: () => ({
		shellState: {
			onBack: vi.fn<() => void>(),
			onSave: vi.fn<() => void>(),
			onCreateVersion: vi.fn<() => Promise<null>>(),
		},
		setActivePanel: vi.fn<(panel: 'explorer' | 'history') => void>(),
	}),
	useWorkbenchStore: (selector: (state: typeof workbenchState) => unknown) => selector(workbenchState),
}))

describe('WorkbenchLayout', () => {
	test('workbench 应在整页顶部渲染窗口顶栏', async () => {
		const { default: WorkbenchLayout } = await import('./WorkbenchLayout')

		render(
			<MemoryRouter initialEntries={['/workbench?documentId=doc-1']}>
				<WorkbenchLayout />
			</MemoryRouter>,
		)

		expect(screen.getByTestId('window-chrome-stub')).toBeInTheDocument()
	})

	test('右侧栏默认应保持收起', async () => {
		const { default: WorkbenchLayout } = await import('./WorkbenchLayout')

		render(
			<MemoryRouter initialEntries={['/workbench?documentId=doc-1']}>
				<WorkbenchLayout />
			</MemoryRouter>,
		)

		expect(screen.queryByTestId('right-panel-stub')).not.toBeInTheDocument()
	})
})
