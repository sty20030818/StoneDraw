import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { FileSearchIcon } from 'lucide-react'
import { toast } from 'sonner'
import EmptyState from '@/components/states/EmptyState'
import { APP_ROUTES } from '@/constants/routes'
import { clearEditorApi, editorSaveSession } from '@/modules/editor'
import { documentService } from '@/services/documents/document.service'
import { useDocumentStore } from '@/stores/document.store'
import { useOverlayStore } from '@/stores/overlay.store'
import { useWorkbenchStore } from '@/stores/workbench.store'
import type { DocumentMeta, SceneFilePayload } from '@/types'
import {
	CanvasShell,
	ExcalidrawHost,
	normalizeWorkbenchScene,
	useWorkbenchShellController,
} from '@/workbench'
import type { EditorContentChangePayload } from '@/workbench/editor-event-bridge'

type WorkbenchLoadState =
	| {
			status: 'loading'
	  }
	| {
			status: 'error'
			title: string
			description: string
	  }
	| {
			status: 'ready'
			document: DocumentMeta
			scene: SceneFilePayload
	  }

const CANVAS_CARD_CLASS =
	'flex h-full min-h-0 flex-1 overflow-hidden rounded-[1.75rem] border border-border/70 bg-background/82 shadow-sm backdrop-blur'

function WorkbenchLoadingCanvas() {
	return (
		<div className={CANVAS_CARD_CLASS}>
			<div className='flex h-full min-h-0 w-full p-4 md:p-5'>
				<div className='h-full w-full rounded-lg border border-border/50 bg-white/95' />
			</div>
		</div>
	)
}

function WorkbenchPage() {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const documentId = searchParams.get('documentId')
	const { patchShellState, resetShellState } = useWorkbenchShellController()
	const openOverlay = useOverlayStore((state) => state.openOverlay)
	const setSelectedDocumentId = useDocumentStore((state) => state.setSelectedDocumentId)
	const syncWorkspaceCollections = useDocumentStore((state) => state.syncWorkspaceCollections)
	const searchDraft = useWorkbenchStore((state) => state.searchDraft)
	const saveStatus = useWorkbenchStore((state) => state.saveStatus)
	const lastSaveError = useWorkbenchStore((state) => state.lastSaveError)
	const isFlushing = useWorkbenchStore((state) => state.isFlushing)
	const isWorkbenchReady = useWorkbenchStore((state) => state.isWorkbenchReady)
	const setActiveDocumentId = useWorkbenchStore((state) => state.setActiveDocumentId)
	const setWorkbenchReady = useWorkbenchStore((state) => state.setWorkbenchReady)
	const setSearchDraft = useWorkbenchStore((state) => state.setSearchDraft)
	const syncDocumentTab = useWorkbenchStore((state) => state.syncDocumentTab)
	const [workbenchLoadState, setWorkbenchLoadState] = useState<WorkbenchLoadState>({
		status: 'loading',
	})
	const latestSaveErrorRef = useRef<string | null>(null)

	const handleManualSave = useCallback(async () => {
		if (workbenchLoadState.status !== 'ready') {
			return false
		}

		const saveResult = await editorSaveSession.saveNow(workbenchLoadState.document)

		if (!saveResult.ok) {
			latestSaveErrorRef.current = saveResult.error.details ?? saveResult.error.message
			toast('保存失败', {
				description: saveResult.error.details ?? saveResult.error.message,
			})
			return false
		}

		setWorkbenchLoadState({
			status: 'ready',
			document: saveResult.data.document,
			scene: saveResult.data.scene,
		})

		return true
	}, [workbenchLoadState])

	const tryFlushBeforeLeaving = useCallback(
		async (options?: { timeoutMs?: number }) => {
			if (
				workbenchLoadState.status !== 'ready' ||
				(saveStatus !== 'dirty' && saveStatus !== 'saving' && saveStatus !== 'error')
			) {
				return true
			}

			const isFlushed = await editorSaveSession.flushBeforeLeave(workbenchLoadState.document, options)

			if (!isFlushed && options?.timeoutMs === undefined) {
				toast('自动保存未完成', {
					description: '系统已继续离开当前页面，最近修改可能未保存。',
				})
			}

			return isFlushed
		},
		[saveStatus, workbenchLoadState],
	)

	const navigateToWorkspace = useCallback(async () => {
		await tryFlushBeforeLeaving()
		navigate(APP_ROUTES.WORKSPACE_HOME)
	}, [navigate, tryFlushBeforeLeaving])

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

			// 工作台进入文档时同步刷新 Workspace 集合，保证最近打开与回退视图是最新状态。
			syncWorkspaceCollections(openResult.data.collections)

			setWorkbenchLoadState({
				status: 'ready',
				document: openResult.data.document,
				scene: normalizedScene.scene,
			})
		}

		void bootstrapWorkbench()

		return () => {
			isMounted = false
			editorSaveSession.dispose()
			clearEditorApi()
			setWorkbenchReady(false)
			setActiveDocumentId(null)
			setSelectedDocumentId(null)
			resetShellState()
		}
	}, [documentId, resetShellState, setActiveDocumentId, setSelectedDocumentId, setWorkbenchReady, syncWorkspaceCollections])

	useEffect(() => {
		if (workbenchLoadState.status !== 'ready') {
			return
		}

		setWorkbenchReady(false)
		setActiveDocumentId(workbenchLoadState.document.id)
		setSelectedDocumentId(workbenchLoadState.document.id)
		syncDocumentTab({
			id: workbenchLoadState.document.id,
			title: workbenchLoadState.document.title,
		})
		editorSaveSession.initialize(workbenchLoadState.scene)
	}, [setActiveDocumentId, setSelectedDocumentId, setWorkbenchReady, syncDocumentTab, workbenchLoadState])

	const handleContentChange = useCallback(
		(payload: EditorContentChangePayload) => {
			if (workbenchLoadState.status !== 'ready') {
				return
			}

			editorSaveSession.onSceneChange(
				workbenchLoadState.document,
				payload.elements,
				payload.appState,
				payload.files,
			)
		},
		[workbenchLoadState],
	)

	useEffect(() => {
		if (workbenchLoadState.status !== 'ready') {
			return
		}

		let isClosingWindow = false
		let unlistenCloseRequested: (() => void) | undefined

		void getCurrentWindow()
			.onCloseRequested(async (event) => {
				if (isClosingWindow || saveStatus === 'saved' || saveStatus === 'idle') {
					return
				}

				event.preventDefault()
				await tryFlushBeforeLeaving({
					timeoutMs: 2000,
				})
				isClosingWindow = true
				await getCurrentWindow().destroy()
			})
			.then((unlisten) => {
				unlistenCloseRequested = unlisten
			})

		return () => {
			unlistenCloseRequested?.()
		}
	}, [saveStatus, tryFlushBeforeLeaving, workbenchLoadState.status])

	useEffect(() => {
		if (workbenchLoadState.status !== 'ready') {
			return
		}

		function handleKeyDown(event: KeyboardEvent) {
			const isSaveShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's'

			if (!isSaveShortcut) {
				return
			}

			event.preventDefault()
			void handleManualSave()
		}

		window.addEventListener('keydown', handleKeyDown)

		return () => {
			window.removeEventListener('keydown', handleKeyDown)
		}
	}, [handleManualSave, workbenchLoadState.status])

	useEffect(() => {
		if (!lastSaveError) {
			latestSaveErrorRef.current = null
			return
		}

		if (latestSaveErrorRef.current === lastSaveError) {
			return
		}

		latestSaveErrorRef.current = lastSaveError
		toast('自动保存失败', {
			description: lastSaveError,
		})
	}, [lastSaveError])

	const handleExportOverlay = useCallback(() => {
		openOverlay('export', {
			documentId,
			documentTitle: workbenchLoadState.status === 'ready' ? workbenchLoadState.document.title : undefined,
			source: 'workbench-titlebar',
		})
	}, [documentId, openOverlay, workbenchLoadState])

	const handleShareOverlay = useCallback(() => {
		openOverlay('share', {
			documentId,
			documentTitle: workbenchLoadState.status === 'ready' ? workbenchLoadState.document.title : undefined,
			source: 'workbench-titlebar',
		})
	}, [documentId, openOverlay, workbenchLoadState])

	useEffect(() => {
		patchShellState({
			documentId,
			documentTitle:
				workbenchLoadState.status === 'ready'
					? workbenchLoadState.document.title
					: workbenchLoadState.status === 'error'
						? workbenchLoadState.title
						: '工作台正在准备文档',
			searchDraft,
			isDocumentReady: isWorkbenchReady,
			saveStatus,
			isFlushing,
			onBack: () => {
				void navigateToWorkspace()
			},
			onSave: () => {
				void handleManualSave()
			},
			onExport: handleExportOverlay,
			onMore: handleShareOverlay,
			onSearchChange: setSearchDraft,
		})
	}, [
		documentId,
		handleExportOverlay,
		handleManualSave,
		handleShareOverlay,
		isFlushing,
		isWorkbenchReady,
		navigateToWorkspace,
		patchShellState,
		saveStatus,
		searchDraft,
		setSearchDraft,
		workbenchLoadState,
	])

	if (workbenchLoadState.status === 'error') {
		return (
			<EmptyState
				title={workbenchLoadState.title}
				description={workbenchLoadState.description}
				icon={FileSearchIcon}
				actionLabel='返回工作区'
				onAction={() => {
					void navigateToWorkspace()
				}}
			/>
		)
	}

	if (workbenchLoadState.status !== 'ready') {
		return <WorkbenchLoadingCanvas />
	}

	return (
		<CanvasShell className={CANVAS_CARD_CLASS}>
			<ExcalidrawHost
				scene={workbenchLoadState.scene}
				onContentChange={handleContentChange}
				onReadyChange={setWorkbenchReady}
			/>
		</CanvasShell>
	)
}

export default WorkbenchPage
