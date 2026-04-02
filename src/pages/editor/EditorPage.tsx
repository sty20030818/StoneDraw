import type { ComponentProps } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Excalidraw } from '@excalidraw/excalidraw'
import '@excalidraw/excalidraw/index.css'
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types'
import { ArrowLeftIcon, DownloadIcon, FileSearchIcon, MoreHorizontalIcon, SearchIcon } from 'lucide-react'
import { toast } from 'sonner'
import { createInitialSceneData } from '@/adapters/excalidraw'
import SceneTopbar, { SCENE_TOPBAR_SEARCH_INPUT_CLASS } from '@/components/layout/SceneTopbar'
import EmptyState from '@/components/states/EmptyState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { APP_ROUTES } from '@/constants/routes'
import { clearEditorApi, observeSceneChange, setEditorApi, setSceneObservationBaseline } from '@/modules/editor'
import { documentService, editorService } from '@/services'
import { useAppStore, useEditorStore } from '@/stores'
import type { DocumentMeta, SceneFilePayload } from '@/types'

type ExcalidrawOnChange = NonNullable<ComponentProps<typeof Excalidraw>['onChange']>
type ExcalidrawChangeArgs = Parameters<ExcalidrawOnChange>

type EditorLoadState =
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
	'stonedraw-editor-shell min-h-0 flex-1 overflow-hidden rounded-[1.75rem] border border-border/70 bg-background/82 shadow-sm backdrop-blur'

const TOPBAR_GROUP_CLASS = 'flex min-w-0 items-center gap-4'
const TOPBAR_LEFT_GROUP_CLASS = 'flex min-w-0 items-center gap-6'
const TOPBAR_ACTIONS_CLASS = 'flex min-w-0 items-center justify-end gap-3'

function EditorLoadingTopbar({ onBack }: { onBack: () => void }) {
	return (
		<SceneTopbar
			left={
				<div className={TOPBAR_LEFT_GROUP_CLASS}>
					<Button
						type='button'
						size='lg'
						variant='outline'
						className='rounded-2xl bg-white/80 px-4'
						onClick={onBack}>
						<ArrowLeftIcon data-icon='inline-start' />
						返回
					</Button>

					<div className={TOPBAR_GROUP_CLASS}>
						<Skeleton className='h-6 w-24 rounded-full md:w-32' />
						<Skeleton className='h-8 w-[4.5rem] rounded-full md:w-20' />
					</div>
				</div>
			}
			center={
				<div className='relative w-full'>
					<SearchIcon className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
					<Input
						type='search'
						disabled
						className={SCENE_TOPBAR_SEARCH_INPUT_CLASS}
						placeholder='搜索画布内容（即将支持）'
					/>
				</div>
			}
			right={
				<div className={TOPBAR_ACTIONS_CLASS}>
					<Button
						type='button'
						size='icon-lg'
						variant='outline'
						className='rounded-2xl bg-white/80'
						title='导出'
						disabled>
						<DownloadIcon />
					</Button>
					<Button
						type='button'
						size='icon-lg'
						variant='outline'
						className='rounded-2xl bg-white/80'
						title='更多'
						disabled>
						<MoreHorizontalIcon />
					</Button>
					<Button
						type='button'
						size='icon-lg'
						variant='outline'
						className='rounded-2xl bg-white/80 text-xs font-medium text-muted-foreground'
						title='预留'
						disabled>
						预
					</Button>
				</div>
			}
		/>
	)
}

function EditorLoadingCanvas() {
	return (
		<div className={CANVAS_CARD_CLASS}>
			<div className='flex h-full min-h-0 p-4 md:p-5'>
				<div className='h-full w-full rounded-lg border border-border/50 bg-white/95' />
			</div>
		</div>
	)
}

function EditorPage() {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const documentId = searchParams.get('documentId')
	const [editorLoadState, setEditorLoadState] = useState<EditorLoadState>({
		status: 'loading',
	})
	const [searchDraft, setSearchDraft] = useState('')
	const commandBridgeStatus = useAppStore((state) => state.commandBridgeStatus)
	const saveStatus = useEditorStore((state) => state.saveStatus)
	const setActiveDocumentId = useEditorStore((state) => state.setActiveDocumentId)
	const setEditorReady = useEditorStore((state) => state.setEditorReady)
	const setSaveStatus = useEditorStore((state) => state.setSaveStatus)
	const latestApiIdRef = useRef<string | null>(null)

	useEffect(() => {
		let isMounted = true

		async function bootstrapEditor() {
			if (!documentId) {
				setEditorLoadState({
					status: 'error',
					title: '缺少文档 ID',
					description: '请先从工作区创建或打开文档，再进入编辑器。',
				})
				return
			}

			setEditorReady(false)
			setEditorLoadState({
				status: 'loading',
			})

			const documentResult = await documentService.getById(documentId)

			if (!isMounted) {
				return
			}

			if (!documentResult.ok) {
				setEditorLoadState({
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
				setEditorLoadState({
					status: 'error',
					title: 'scene 读取失败',
					description: sceneResult.error.message,
				})
				return
			}

			setEditorLoadState({
				status: 'ready',
				document: documentResult.data,
				scene: sceneResult.data,
			})
		}

		void bootstrapEditor()

		return () => {
			isMounted = false
			clearEditorApi()
			setEditorReady(false)
			setActiveDocumentId(null)
			setSaveStatus('idle')
		}
	}, [documentId, setActiveDocumentId, setEditorReady, setSaveStatus])

	useEffect(() => {
		if (editorLoadState.status !== 'ready') {
			return
		}

		setActiveDocumentId(editorLoadState.document.id)
		setSaveStatus('saved')
		setSceneObservationBaseline(editorLoadState.scene)
	}, [editorLoadState, setActiveDocumentId, setSaveStatus])

	const initialData = useMemo(() => {
		if (editorLoadState.status !== 'ready') {
			return null
		}

		return createInitialSceneData(editorLoadState.scene)
	}, [editorLoadState])

	const statusBadge = useMemo(() => {
		if (commandBridgeStatus === 'error') {
			return {
				label: '保存失败',
				className: 'bg-destructive/12 text-destructive ring-1 ring-destructive/15',
			}
		}

		if (saveStatus === 'saving' || saveStatus === 'dirty') {
			return {
				label: '保存中',
				className: 'bg-amber-500/12 text-amber-700 ring-1 ring-amber-500/15',
			}
		}

		return {
			label: '已保存',
			className: 'bg-emerald-500/12 text-emerald-700 ring-1 ring-emerald-500/15',
		}
	}, [commandBridgeStatus, saveStatus])

	const handleSceneChange = useCallback(
		(...args: ExcalidrawChangeArgs) => {
			if (editorLoadState.status !== 'ready') {
				return
			}

			const [elements, appState, files] = args
			observeSceneChange(editorLoadState.document.id, elements, appState, files, editorLoadState.document.title)
		},
		[editorLoadState],
	)

	const handleApiReady = useCallback(
		(api: ExcalidrawImperativeAPI) => {
			if (!setEditorApi(api)) {
				return
			}

			latestApiIdRef.current = api.id

			// Excalidraw 初始化阶段会同步触发回调，这里延后写入外部状态，避免挂载期更新。
			queueMicrotask(() => {
				if (latestApiIdRef.current === api.id) {
					setEditorReady(true)
				}
			})
		},
		[setEditorReady],
	)

	function handleExportPlaceholder() {
		toast('导出入口已预留，真实导出流程后续接入。')
	}

	function handleMorePlaceholder() {
		toast('更多文档操作后续会统一收口到这里。')
	}

	if (editorLoadState.status === 'error') {
		return (
			<EmptyState
				actionLabel='返回工作区'
				description={editorLoadState.description}
				icon={FileSearchIcon}
				onAction={() => {
					navigate(APP_ROUTES.WORKSPACE)
				}}
				title={editorLoadState.title}
			/>
		)
	}

	const isEditorReady = editorLoadState.status === 'ready'

	return (
		<section className='flex h-full min-h-0 flex-col gap-3 overflow-hidden md:gap-4'>
			<div className='shrink-0'>
				{isEditorReady ? (
					<SceneTopbar
						left={
							<div className={TOPBAR_LEFT_GROUP_CLASS}>
								<Button
									type='button'
									size='lg'
									variant='outline'
									className='rounded-2xl bg-white/80 px-4'
									onClick={() => {
										navigate(APP_ROUTES.WORKSPACE)
									}}>
									<ArrowLeftIcon data-icon='inline-start' />
									返回
								</Button>

								<div className={TOPBAR_GROUP_CLASS}>
									<h2 className='truncate text-base font-semibold tracking-tight md:text-lg'>
										{editorLoadState.document.title}
									</h2>
									<span
										className={`inline-flex h-8 shrink-0 items-center justify-center rounded-full px-4 text-xs font-medium ${statusBadge.className}`}>
										{statusBadge.label}
									</span>
								</div>
							</div>
						}
						center={
							<div className='relative w-full'>
								<SearchIcon className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
								<Input
									value={searchDraft}
									type='search'
									className={SCENE_TOPBAR_SEARCH_INPUT_CLASS}
									onChange={(event) => {
										setSearchDraft(event.target.value)
									}}
									placeholder='搜索画布内容（即将支持）'
								/>
							</div>
						}
						right={
							<div className={TOPBAR_ACTIONS_CLASS}>
								<Button
									type='button'
									size='icon-lg'
									variant='outline'
									className='rounded-2xl bg-white/80'
									title='导出'
									onClick={handleExportPlaceholder}>
									<DownloadIcon />
								</Button>
								<Button
									type='button'
									size='icon-lg'
									variant='outline'
									className='rounded-2xl bg-white/80'
									title='更多'
									onClick={handleMorePlaceholder}>
									<MoreHorizontalIcon />
								</Button>
								<Button
									type='button'
									size='icon-lg'
									variant='outline'
									className='rounded-2xl bg-white/80 text-xs font-medium text-muted-foreground'
									title='预留'
									disabled>
									预
								</Button>
							</div>
						}
					/>
				) : (
					<EditorLoadingTopbar
						onBack={() => {
							navigate(APP_ROUTES.WORKSPACE)
						}}
					/>
				)}
			</div>

			{isEditorReady ? (
				<div className={CANVAS_CARD_CLASS}>
					<div className='h-full min-h-0 [&_.App-menu_top]:rounded-none [&_.excalidraw]:h-full'>
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
				</div>
			) : (
				<EditorLoadingCanvas />
			)}
		</section>
	)
}

export default EditorPage
