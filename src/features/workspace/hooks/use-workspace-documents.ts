import { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { buildWorkbenchRoute } from '@/shared/constants/routes'
import type { DocumentMeta } from '@/shared/types'
import { documentService, useDocumentStore } from '@/features/documents'
import { useOverlayStore } from '@/features/overlays'
import { workspaceCollectionsService } from '@/features/workspace/services'
import { useWorkspaceStore } from '@/features/workspace/state'

type WorkspaceDocumentsActions = {
	loadWorkspaceData: () => Promise<void>
	handleOpenDocument: (documentId: string) => Promise<void>
	handleRenameDocument: (documentId: string, title: string) => Promise<boolean>
	handleMoveToTrash: (document: DocumentMeta) => void
	handleRestoreDocument: (document: DocumentMeta) => Promise<void>
	handlePermanentlyDeleteDocument: (document: DocumentMeta) => Promise<void>
}

async function refreshWorkspaceCollections() {
	return workspaceCollectionsService.loadCollections()
}

export function useWorkspaceDocuments(autoLoad = true): WorkspaceDocumentsActions {
	const navigate = useNavigate()
	const openConfirmDialog = useOverlayStore((state) => state.openConfirmDialog)
	const startCollectionLoading = useWorkspaceStore((state) => state.startCollectionLoading)
	const failCollectionLoading = useWorkspaceStore((state) => state.failCollectionLoading)
	const syncWorkspaceCollections = useWorkspaceStore((state) => state.syncWorkspaceCollections)
	const setSelectedDocumentId = useDocumentStore((state) => state.setSelectedDocumentId)

	const loadWorkspaceData = useCallback(async () => {
		startCollectionLoading()
		const collectionsResult = await refreshWorkspaceCollections()

		if (!collectionsResult.ok) {
			failCollectionLoading(collectionsResult.error.message)
			return
		}

		syncWorkspaceCollections(collectionsResult.data)
	}, [failCollectionLoading, startCollectionLoading, syncWorkspaceCollections])

	useEffect(() => {
		if (!autoLoad) {
			return
		}

		void loadWorkspaceData()
	}, [autoLoad, loadWorkspaceData])

	const handleOpenDocument = useCallback(
		async (documentId: string) => {
			const result = await documentService.openDocument(documentId)

			if (!result.ok) {
				toast.error(result.error.message, {
					description: result.error.details,
				})
				return
			}

			const collectionsResult = await refreshWorkspaceCollections()

			if (collectionsResult.ok) {
				syncWorkspaceCollections(collectionsResult.data)
			}

			setSelectedDocumentId(result.data.document.id)
			navigate(buildWorkbenchRoute(result.data.document.id))
		},
		[navigate, setSelectedDocumentId, syncWorkspaceCollections],
	)

	const handleRenameDocument = useCallback(
		async (documentId: string, title: string) => {
			const normalizedTitle = title.trim()

			if (!normalizedTitle) {
				toast.error('标题不能为空。')
				return false
			}

			const result = await documentService.renameDocument(documentId, normalizedTitle)

			if (!result.ok) {
				toast.error(result.error.message)
				return false
			}

			const collectionsResult = await refreshWorkspaceCollections()

			if (collectionsResult.ok) {
				syncWorkspaceCollections(collectionsResult.data)
			}

			toast.success('文档标题已更新。')
			return true
		},
		[syncWorkspaceCollections],
	)

	const executeMoveToTrash = useCallback(
		async (document: DocumentMeta) => {
			const result = await documentService.trashDocument(document.id)

			if (!result.ok) {
				toast.error(result.error.message)
				return
			}

			const collectionsResult = await refreshWorkspaceCollections()

			if (collectionsResult.ok) {
				syncWorkspaceCollections(collectionsResult.data)
			}

			toast.success(`已将《${document.title}》移动到回收站。`)
		},
		[syncWorkspaceCollections],
	)

	const handleMoveToTrash = useCallback(
		(document: DocumentMeta) => {
			openConfirmDialog({
				title: '删除到回收站',
				description: `确认将《${document.title}》移动到回收站吗？当前版本不会永久删除，可在工作区内恢复。`,
				confirmLabel: '移入回收站',
				cancelLabel: '取消',
				onConfirm: () => {
					void executeMoveToTrash(document)
				},
			})
		},
		[executeMoveToTrash, openConfirmDialog],
	)

	const handleRestoreDocument = useCallback(
		async (document: DocumentMeta) => {
			const result = await documentService.restoreDocument(document.id)

			if (!result.ok) {
				toast.error(result.error.message)
				return
			}

			const collectionsResult = await refreshWorkspaceCollections()

			if (collectionsResult.ok) {
				syncWorkspaceCollections(collectionsResult.data)
			}

			toast.success(`已恢复《${document.title}》。`)
		},
		[syncWorkspaceCollections],
	)

	const handlePermanentlyDeleteDocument = useCallback(
		async (document: DocumentMeta) => {
			const result = await documentService.permanentlyDeleteDocument(document.id)

			if (!result.ok) {
				toast.error(result.error.message, {
					description: result.error.details,
				})
				return
			}

			const collectionsResult = await refreshWorkspaceCollections()

			if (collectionsResult.ok) {
				syncWorkspaceCollections(collectionsResult.data)
			}

			toast.success(`已永久删除《${document.title}》。`)
		},
		[syncWorkspaceCollections],
	)

	return {
		loadWorkspaceData,
		handleOpenDocument,
		handleRenameDocument,
		handleMoveToTrash,
		handleRestoreDocument,
		handlePermanentlyDeleteDocument,
	}
}
