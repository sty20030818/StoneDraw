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
	WorkspaceDocumentCards: () => <div>文档卡片组件</div>,
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
	test('HomePage 应接入统一页面壳', async () => {
		useWorkspaceStoreMock.mockImplementation((selector) => selector(workspaceState))
		const { default: HomePage } = await import('./HomePage')

		render(<HomePage />)

		expect(screen.getByTestId('workspace-page-shell')).toBeInTheDocument()
		expect(screen.getByText('快捷动作')).toBeInTheDocument()
		expect(screen.getByText('最近打开')).toBeInTheDocument()
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
		expect(screen.getByPlaceholderText('搜索文档标题或路径')).toBeInTheDocument()
		expect(screen.getByText('文档结果')).toBeInTheDocument()
	})

	test('ArchivePage 应接入统一页面壳', async () => {
		useWorkspaceStoreMock.mockImplementation((selector) => selector(workspaceState))
		const { default: ArchivePage } = await import('./ArchivePage')

		render(<ArchivePage />)

		expect(screen.getByTestId('workspace-page-shell')).toBeInTheDocument()
		expect(screen.getByText('回收站')).toBeInTheDocument()
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
})
