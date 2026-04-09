import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { documentService, useDocumentStore } from '@/features/documents'
import { clearEditorApi, normalizeWorkbenchScene } from '@/features/workbench/editor'
import { documentPersistenceSession } from '@/features/workbench/services'
import { useWorkbenchStore } from '@/features/workbench/state'
import type { WorkbenchLoadState } from '../workbench-page.types'

type UseWorkbenchDocumentLifecycleOptions = {
	documentId: string | null
	resetShellActions: () => void
}

export function useWorkbenchDocumentLifecycle({ documentId, resetShellActions }: UseWorkbenchDocumentLifecycleOptions) {
	const setSelectedDocumentId = useDocumentStore((state) => state.setSelectedDocumentId)
	const setActiveDocumentId = useWorkbenchStore((state) => state.setActiveDocumentId)
	const setDocumentTitle = useWorkbenchStore((state) => state.setDocumentTitle)
	const setWorkbenchReady = useWorkbenchStore((state) => state.setWorkbenchReady)
	const syncDocumentTab = useWorkbenchStore((state) => state.syncDocumentTab)
	const [workbenchLoadState, setWorkbenchLoadState] = useState<WorkbenchLoadState>({
		status: 'loading',
	})

	useEffect(() => {
		let isMounted = true

		async function bootstrapWorkbench() {
			if (!documentId) {
				setWorkbenchLoadState({
					status: 'error',
					title: '缺少文档 ID',
					description: '请先从工作区创建或打开文档，再进入工作台。',
				})
				return
			}

			setWorkbenchReady(false)
			setWorkbenchLoadState({
				status: 'loading',
			})

			const openResult = await documentService.openDocument(documentId)

			if (!isMounted) {
				return
			}

			if (!openResult.ok) {
				setWorkbenchLoadState({
					status: 'error',
					title: '文档不存在',
					description: openResult.error.details ?? openResult.error.message,
				})
				return
			}

			const normalizedScene = normalizeWorkbenchScene(openResult.data.scene, {
				documentId: openResult.data.document.id,
				title: openResult.data.document.title,
			})

			if (normalizedScene.recoveredFromFallback) {
				toast('文档场景已回退为空白内容', {
					description: '检测到损坏或不匹配的 current.scene，系统已自动切换为空白场景。',
				})
			}

			setWorkbenchLoadState({
				status: 'ready',
				document: openResult.data.document,
				scene: normalizedScene.scene,
			})
		}

		void bootstrapWorkbench()

		return () => {
			isMounted = false
			documentPersistenceSession.dispose()
			clearEditorApi()
			setWorkbenchReady(false)
			setActiveDocumentId(null)
			setDocumentTitle('未选择文档')
			setSelectedDocumentId(null)
			resetShellActions()
		}
	}, [documentId, resetShellActions, setActiveDocumentId, setDocumentTitle, setSelectedDocumentId, setWorkbenchReady])

	useEffect(() => {
		if (workbenchLoadState.status !== 'ready') {
			return
		}

		setWorkbenchReady(false)
		setActiveDocumentId(workbenchLoadState.document.id)
		setDocumentTitle(workbenchLoadState.document.title)
		setSelectedDocumentId(workbenchLoadState.document.id)
		syncDocumentTab({
			id: workbenchLoadState.document.id,
			title: workbenchLoadState.document.title,
		})
		documentPersistenceSession.initialize(workbenchLoadState.scene)
	}, [
		setActiveDocumentId,
		setDocumentTitle,
		setSelectedDocumentId,
		setWorkbenchReady,
		syncDocumentTab,
		workbenchLoadState,
	])

	return {
		workbenchLoadState,
		setWorkbenchLoadState,
	}
}
