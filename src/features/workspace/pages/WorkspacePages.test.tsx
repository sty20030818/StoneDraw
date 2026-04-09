import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, test, vi } from 'vitest'

const {
	useWorkspaceStoreMock,
	loadWorkspaceDataMock,
	handleOpenDocumentMock,
	handleRenameDocumentMock,
	handleMoveToTrashMock,
	handleRestoreDocumentMock,
	handlePermanentlyDeleteDocumentMock,
	openNewDocumentDialogMock,
	openConfirmDialogMock,
	useAppStoreMock,
} = vi.hoisted(() => ({
	useWorkspaceStoreMock: vi.fn<(selector: (state: Record<string, unknown>) => unknown) => unknown>(),
	loadWorkspaceDataMock: vi.fn<() => Promise<void>>(),
	handleOpenDocumentMock: vi.fn<(documentId: string) => Promise<void>>(),
	handleRenameDocumentMock: vi.fn<(documentId: string, title: string) => Promise<boolean>>(),
	handleMoveToTrashMock: vi.fn<(document: Record<string, unknown>) => void>(),
	handleRestoreDocumentMock: vi.fn<(document: Record<string, unknown>) => Promise<void>>(),
	handlePermanentlyDeleteDocumentMock: vi.fn<(document: Record<string, unknown>) => Promise<void>>(),
	openNewDocumentDialogMock: vi.fn<(payload: Record<string, unknown>) => void>(),
	openConfirmDialogMock: vi.fn<(payload: Record<string, unknown>) => void>(),
	useAppStoreMock: vi.fn<(selector: (state: Record<string, unknown>) => unknown) => unknown>(),
}))

vi.mock('@/features/documents', () => ({
	HomeQuickActions: () => <div>快捷动作组件</div>,
	RecentDocumentList: () => <div>最近打开组件</div>,
	DocumentListToolbar: () => <div>文档工具条组件</div>,
	DocumentListItem: ({ document }: { document: { title: string } }) => <div>{document.title}</div>,
}))

vi.mock('@/features/overlays', () => ({
	useOverlayStore: (selector: (state: Record<string, unknown>) => unknown) =>
		selector({
			openNewDocumentDialog: openNewDocumentDialogMock,
			openConfirmDialog: openConfirmDialogMock,
		}),
}))

vi.mock('@/features/workspace/state', () => ({
	useWorkspaceStore: (selector: (state: Record<string, unknown>) => unknown) => useWorkspaceStoreMock(selector),
}))

vi.mock('@/features/workspace/hooks', () => ({
	useWorkspaceDocuments: () => ({
		loadWorkspaceData: loadWorkspaceDataMock,
		handleOpenDocument: handleOpenDocumentMock,
		handleRenameDocument: handleRenameDocumentMock,
		handleMoveToTrash: handleMoveToTrashMock,
		handleRestoreDocument: handleRestoreDocumentMock,
		handlePermanentlyDeleteDocument: handlePermanentlyDeleteDocumentMock,
	}),
}))

vi.mock('@/app/state', () => ({
	useAppStore: (selector: (state: Record<string, unknown>) => unknown) => useAppStoreMock(selector),
}))

const workspaceState = {
	recentDocuments: [{ id: 'doc-1', title: '最近文档', updatedAt: 1, lastOpenedAt: 1 }],
	documents: [{ id: 'doc-1', title: '文档一', updatedAt: 1 }],
	trashedDocuments: [{ id: 'trash-1', title: '已删除文档', updatedAt: 1, deletedAt: 1 }],
	collectionStatus: 'ready',
	collectionErrorMessage: null,
}

const appState = {
	localDirectoryStatus: 'ready',
	localDirectories: null,
	localDirectoriesReadyAt: null,
	databaseStatus: 'ready',
	databaseHealth: null,
	databaseReadyAt: null,
	activeSceneKey: 'workspace',
	activeRoutePath: '/workspace/home',
}

describe('Workspace pages', () => {
	test('HomePage 应渲染原型化首页骨架', async () => {
		useWorkspaceStoreMock.mockImplementation((selector) => selector(workspaceState))
		const { default: HomePage } = await import('./HomePage')

		render(<HomePage />)

		expect(screen.getByTestId('workspace-page-shell')).toBeInTheDocument()
		expect(screen.getByText(/石头鱼/)).toBeInTheDocument()
		expect(screen.getByText('新建空白文档')).toBeInTheDocument()
		expect(screen.getByText('从模板新建')).toBeInTheDocument()
		expect(screen.getByText('导入文件')).toBeInTheDocument()
		expect(screen.getByText('近期活动')).toBeInTheDocument()
		expect(screen.getByText('查看全部')).toBeInTheDocument()
	})

	test('DocumentsPage 应接入统一页面壳与工具区', async () => {
		useWorkspaceStoreMock.mockImplementation((selector) => selector(workspaceState))
		const { default: DocumentsPage } = await import('./DocumentsPage')

		render(
			<MemoryRouter initialEntries={['/workspace/documents']}>
				<DocumentsPage />
			</MemoryRouter>,
		)

		expect(screen.getByTestId('workspace-page-shell')).toBeInTheDocument()
		expect(screen.getByText('文档工具条组件')).toBeInTheDocument()
		expect(screen.getByText('文档列表')).toBeInTheDocument()
		expect(screen.getByText('文档一')).toBeInTheDocument()
	})

	test('ArchivePage 应接入统一页面壳', async () => {
		useWorkspaceStoreMock.mockImplementation((selector) => selector(workspaceState))
		const { default: ArchivePage } = await import('./ArchivePage')

		render(
			<MemoryRouter initialEntries={['/workspace/archive']}>
				<ArchivePage />
			</MemoryRouter>,
		)

		expect(screen.getByTestId('workspace-page-shell')).toBeInTheDocument()
		expect(screen.getByText('回收站')).toBeInTheDocument()
	})

	test('ArchivePage 空态应提供返回文档入口', async () => {
		useWorkspaceStoreMock.mockImplementation((selector) =>
			selector({
				...workspaceState,
				trashedDocuments: [],
			}),
		)
		const { default: ArchivePage } = await import('./ArchivePage')

		render(
			<MemoryRouter initialEntries={['/workspace/archive']}>
				<ArchivePage />
			</MemoryRouter>,
		)

		expect(screen.getByText('返回文档库')).toBeInTheDocument()
	})

	test('SettingsPage 应接入统一页面壳', async () => {
		useAppStoreMock.mockImplementation((selector) => selector(appState))
		const { default: SettingsPage } = await import('@/features/settings/pages/SettingsPage')

		render(<SettingsPage />)

		expect(screen.getByTestId('workspace-page-shell')).toBeInTheDocument()
		expect(screen.getByText('当前会话概览')).toBeInTheDocument()
		expect(screen.getByText('目录健康检查')).toBeInTheDocument()
		expect(screen.getByText('数据库健康检查')).toBeInTheDocument()
	})

	test('DocumentsPage 加载态应渲染统一 skeleton', async () => {
		useWorkspaceStoreMock.mockImplementation((selector) =>
			selector({
				...workspaceState,
				collectionStatus: 'loading',
			}),
		)
		const { default: DocumentsPage } = await import('./DocumentsPage')

		const { container } = render(
			<MemoryRouter initialEntries={['/workspace/documents']}>
				<DocumentsPage />
			</MemoryRouter>,
		)

		expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0)
	})

	test('SettingsPage 异常状态应展示显式错误提示', async () => {
		useAppStoreMock.mockImplementation((selector) =>
			selector({
				...appState,
				localDirectoryStatus: 'error',
				databaseStatus: 'error',
			}),
		)
		const { default: SettingsPage } = await import('@/features/settings/pages/SettingsPage')

		render(<SettingsPage />)

		expect(screen.getByText('目录健康检查异常。请检查本地工作目录初始化结果和启动日志。')).toBeInTheDocument()
		expect(screen.getByText('数据库健康检查异常。请检查数据库文件、迁移状态和错误日志。')).toBeInTheDocument()
	})
})
