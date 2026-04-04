import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useDialogHost } from '@/components/feedback/DialogHost'
import { buildWorkbenchRoute } from '@/constants/routes'
import { documentService } from '@/services/documents/document.service'
import { useDocumentStore } from '@/stores/document.store'
import type { DocumentMeta } from '@/types'

type WorkspaceDocumentsActions = {
	isCreating: boolean
	loadWorkspaceData: () => Promise<void>
	handleCreateDocument: () => Promise<void>
	handleOpenDocument: (documentId: string) => Promise<void>
	handleRenameDocument: (documentId: string, title: string) => Promise<boolean>
	handleMoveToTrash: (document: DocumentMeta) => void
	handleRestoreDocument: (document: DocumentMeta) => Promise<void>
}

export function useWorkspaceDocuments(autoLoad = true): WorkspaceDocumentsActions {
	const navigate = useNavigate()
	const { openConfirmDialog } = useDialogHost()
	const documents = useDocumentStore((state) => state.documents)
	const recentDocuments = useDocumentStore((state) => state.recentDocuments)
	const trashedDocuments = useDocumentStore((state) => state.trashedDocuments)
	const startCollectionLoading = useDocumentStore((state) => state.startCollectionLoading)
	const completeCollectionLoading = useDocumentStore((state) => state.completeCollectionLoading)
	const failCollectionLoading = useDocumentStore((state) => state.failCollectionLoading)
	const setSelectedDocumentId = useDocumentStore((state) => state.setSelectedDocumentId)
	const [isCreating, setIsCreating] = useState(false)

	const loadWorkspaceData = useCallback(async () => {
		startCollectionLoading()

		const [documentsResult, recentDocumentsResult, trashedDocumentsResult] = await Promise.all([
			documentService.list(),
			documentService.listRecent(),
			documentService.listTrashed(),
		])

		if (!documentsResult.ok) {
			failCollectionLoading(documentsResult.error.message)
			return
		}

		if (!recentDocumentsResult.ok) {
			failCollectionLoading(recentDocumentsResult.error.message)
			return
		}

		if (!trashedDocumentsResult.ok) {
			failCollectionLoading(trashedDocumentsResult.error.message)
			return
		}

		completeCollectionLoading({
			documents: documentsResult.data,
			recentDocuments: recentDocumentsResult.data,
			trashedDocuments: trashedDocumentsResult.data,
		})
	}, [completeCollectionLoading, failCollectionLoading, startCollectionLoading])

	useEffect(() => {
		if (!autoLoad) {
			return
		}

		void loadWorkspaceData()
	}, [autoLoad, loadWorkspaceData])

	const handleCreateDocument = useCallback(async () => {
		setIsCreating(true)
		const result = await documentService.create('未命名文档')
		setIsCreating(false)

		if (!result.ok) {
			toast.error(result.error.message)
			return
		}

		completeCollectionLoading({
			documents: [result.data, ...documents.filter((item) => item.id !== result.data.id)],
			recentDocuments,
			trashedDocuments,
		})
		setSelectedDocumentId(result.data.id)
		navigate(buildWorkbenchRoute(result.data.id))
	}, [completeCollectionLoading, documents, navigate, recentDocuments, setSelectedDocumentId, trashedDocuments])

	const handleOpenDocument = useCallback(async (documentId: string) => {
		const result = await documentService.open(documentId)

		if (!result.ok) {
			toast.error(result.error.message)
			return
		}

		setSelectedDocumentId(result.data.id)
		navigate(buildWorkbenchRoute(result.data.id))
	}, [navigate, setSelectedDocumentId])

	const handleRenameDocument = useCallback(async (documentId: string, title: string) => {
		const normalizedTitle = title.trim()

		if (!normalizedTitle) {
			toast.error('标题不能为空。')
			return false
		}

		const result = await documentService.rename(documentId, normalizedTitle)

		if (!result.ok) {
			toast.error(result.error.message)
			return false
		}

		await loadWorkspaceData()
		toast.success('文档标题已更新。')
		return true
	}, [loadWorkspaceData])

	const executeMoveToTrash = useCallback(async (document: DocumentMeta) => {
		const result = await documentService.moveToTrash(document.id)

		if (!result.ok) {
			toast.error(result.error.message)
			return
		}

		await loadWorkspaceData()
		toast.success(`已将《${document.title}》移动到回收站。`)
	}, [loadWorkspaceData])

	const handleMoveToTrash = useCallback((document: DocumentMeta) => {
		openConfirmDialog({
			title: '删除到回收站',
			description: `确认将《${document.title}》移动到回收站吗？当前版本不会永久删除，可在工作区内恢复。`,
			confirmLabel: '移入回收站',
			cancelLabel: '取消',
			onConfirm: () => {
				void executeMoveToTrash(document)
			},
		})
	}, [executeMoveToTrash, openConfirmDialog])

	const handleRestoreDocument = useCallback(async (document: DocumentMeta) => {
		const result = await documentService.restore(document.id)

		if (!result.ok) {
			toast.error(result.error.message)
			return
		}

		await loadWorkspaceData()
		toast.success(`已恢复《${document.title}》。`)
	}, [loadWorkspaceData])

	return {
		isCreating,
		loadWorkspaceData,
		handleCreateDocument,
		handleOpenDocument,
		handleRenameDocument,
		handleMoveToTrash,
		handleRestoreDocument,
	}
}
