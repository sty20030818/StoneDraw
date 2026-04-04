import type { ComponentProps } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { Excalidraw } from '@excalidraw/excalidraw'
import '@excalidraw/excalidraw/index.css'
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types'
import { FileSearchIcon } from 'lucide-react'
import { toast } from 'sonner'
import { createInitialSceneData } from '@/adapters/excalidraw'
import { CanvasShell, useWorkbenchShell } from '@/components/workbench'
import EmptyState from '@/components/states/EmptyState'
import { APP_ROUTES } from '@/constants/routes'
import { clearEditorApi, editorSaveSession, setEditorApi } from '@/modules/editor'
import { documentService } from '@/services/documents/document.service'
import { editorService } from '@/services/workbench/editor.service'
import { useDocumentStore } from '@/stores/document.store'
import { useOverlayStore } from '@/stores/overlay.store'
import { useWorkbenchStore } from '@/stores/workbench.store'
import type { DocumentMeta, SceneFilePayload } from '@/types'

type ExcalidrawOnChange = NonNullable<ComponentProps<typeof Excalidraw>['onChange']>
type ExcalidrawChangeArgs = Parameters<ExcalidrawOnChange>

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

const EXCALIDRAW_UI_OPTIONS = {
	canvasActions: {
		changeViewBackgroundColor: false,
		clearCanvas: false,
		export: false,
		loadScene: false,
		saveAsImage: false,
		saveToActiveFile: false,
		toggleTheme: false,
	},
} satisfies NonNullable<ComponentProps<typeof Excalidraw>['UIOptions']>

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
	const { patchShellState, resetShellState } = useWorkbenchShell()
	const openOverlay = useOverlayStore((state) => state.openOverlay)
	const setSelectedDocumentId = useDocumentStore((state) => state.setSelectedDocumentId)
	const searchDraft = useWorkbenchStore((state) => state.searchDraft)
	const saveStatus = useWorkbenchStore((state) => state.saveStatus)
	const lastSaveError = useWorkbenchStore((state) => state.lastSaveError)
	const isFlushing = useWorkbenchStore((state) => state.isFlushing)
	const setActiveDocumentId = useWorkbenchStore((state) => state.setActiveDocumentId)
	const setWorkbenchReady = useWorkbenchStore((state) => state.setWorkbenchReady)
	const setSearchDraft = useWorkbenchStore((state) => state.setSearchDraft)
	const syncDocumentTab = useWorkbenchStore((state) => state.syncDocumentTab)
	const [workbenchLoadState, setWorkbenchLoadState] = useState<WorkbenchLoadState>({
		status: 'loading',
	})
	const latestApiIdRef = useRef<string | null>(null)
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

			const documentResult = await documentService.getById(documentId)

			if (!isMounted) {
				return
			}

			if (!documentResult.ok) {
				setWorkbenchLoadState({
					status: 'error',
					title: '文档不存在',
					description: documentResult.error.message,
				})
				return
			}

			const sceneResult = await editorService.loadScene(documentId)

			if (!isMounted) {
				return
			}

			if (!sceneResult.ok) {
				setWorkbenchLoadState({
					status: 'error',
					title: 'scene 读取失败',
					description: sceneResult.error.message,
				})
				return
			}

			setWorkbenchLoadState({
				status: 'ready',
				document: documentResult.data,
				scene: sceneResult.data,
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
	}, [documentId, resetShellState, setActiveDocumentId, setSelectedDocumentId, setWorkbenchReady])

	useEffect(() => {
		if (workbenchLoadState.status !== 'ready') {
			return
		}

		setActiveDocumentId(workbenchLoadState.document.id)
		setSelectedDocumentId(workbenchLoadState.document.id)
		setWorkbenchReady(true)
		syncDocumentTab({
			id: workbenchLoadState.document.id,
			title: workbenchLoadState.document.title,
		})
		editorSaveSession.initialize(workbenchLoadState.scene)
	}, [setActiveDocumentId, setSelectedDocumentId, setWorkbenchReady, syncDocumentTab, workbenchLoadState])

	const initialData = useMemo(() => {
		if (workbenchLoadState.status !== 'ready') {
			return null
		}

		return createInitialSceneData(workbenchLoadState.scene)
	}, [workbenchLoadState])

	const handleSceneChange = useCallback(
		(...args: ExcalidrawChangeArgs) => {
			if (workbenchLoadState.status !== 'ready') {
				return
			}

			const [elements, appState, files] = args
			editorSaveSession.onSceneChange(workbenchLoadState.document, elements, appState, files)
		},
		[workbenchLoadState],
	)

	const handleApiReady = useCallback(
		(api: ExcalidrawImperativeAPI) => {
			if (!setEditorApi(api)) {
				return
			}

			latestApiIdRef.current = api.id

			queueMicrotask(() => {
				if (latestApiIdRef.current === api.id) {
					setWorkbenchReady(true)
				}
			})
		},
		[setWorkbenchReady],
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
			isDocumentReady: workbenchLoadState.status === 'ready',
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
			<div className='h-full min-h-0 w-full [&_.App-menu_top]:rounded-none [&_.excalidraw]:h-full'>
				<Excalidraw
					UIOptions={EXCALIDRAW_UI_OPTIONS}
					excalidrawAPI={handleApiReady}
					initialData={initialData ?? undefined}
					langCode='zh-CN'
					onChange={handleSceneChange}
					renderTopRightUI={() => null}
					theme='light'
				/>
			</div>
		</CanvasShell>
	)
}

export default WorkbenchPage
