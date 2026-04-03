import { describe, expect, test } from 'vitest'
import { createDocumentMeta } from '@/test/fixtures/document'
import { useWorkspaceStore } from './workspace.store'

describe('workspace.store', () => {
	test('startDocumentsLoading 与 completeDocumentsLoading 应更新主列表状态', () => {
		const workspaceStore = useWorkspaceStore.getState()
		const document = createDocumentMeta({
			id: 'doc-workspace-store',
		})

		workspaceStore.startDocumentsLoading()
		expect(useWorkspaceStore.getState()).toMatchObject({
			documentsStatus: 'loading',
			documentsErrorMessage: null,
		})

		workspaceStore.completeDocumentsLoading({
			documents: [document],
			recentDocuments: [document],
			trashedDocuments: [],
		})

		expect(useWorkspaceStore.getState()).toMatchObject({
			documentsStatus: 'ready',
			documents: [document],
			recentDocuments: [document],
			trashedDocuments: [],
			documentsErrorMessage: null,
		})
	})

	test('failDocumentsLoading 应清空文档列表并写入错误消息', () => {
		const workspaceStore = useWorkspaceStore.getState()

		workspaceStore.failDocumentsLoading('读取失败')

		expect(useWorkspaceStore.getState()).toMatchObject({
			documentsStatus: 'error',
			documentsErrorMessage: '读取失败',
			documents: [],
			recentDocuments: [],
			trashedDocuments: [],
		})
	})

	test('setCurrentView 与 setSelectedDocumentId 应更新工作区选择状态', () => {
		const workspaceStore = useWorkspaceStore.getState()

		workspaceStore.setCurrentView('documents')
		workspaceStore.setSelectedDocumentId('doc-selected')

		expect(useWorkspaceStore.getState()).toMatchObject({
			currentView: 'documents',
			selectedDocumentId: 'doc-selected',
		})
	})

	test('reset 应恢复工作区初始状态', () => {
		const workspaceStore = useWorkspaceStore.getState()

		workspaceStore.setCurrentView('documents')
		workspaceStore.setSelectedDocumentId('doc-selected')
		workspaceStore.failDocumentsLoading('读取失败')
		workspaceStore.reset()

		expect(useWorkspaceStore.getState()).toMatchObject({
			currentView: 'home',
			documentsStatus: 'idle',
			documentsErrorMessage: null,
			selectedDocumentId: null,
		})
	})
})
