import type { ComponentProps } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Excalidraw } from '@excalidraw/excalidraw'
import '@excalidraw/excalidraw/index.css'
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types'
import { DatabaseZapIcon, FileSearchIcon, PenToolIcon, PencilLineIcon } from 'lucide-react'
import { toast } from 'sonner'
import { createInitialSceneData } from '@/adapters/excalidraw'
import EmptyState from '@/components/states/EmptyState'
import LoadingState from '@/components/states/LoadingState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { APP_STATUS_BADGE } from '@/constants'
import { APP_ROUTES } from '@/constants/routes'
import { clearEditorApi, observeSceneChange, readActiveScene, setEditorApi } from '@/modules/editor'
import { documentService, editorService } from '@/services'
import { useAppStore, useEditorStore } from '@/stores'
import type { DocumentMeta, SceneFilePayload } from '@/types'
import { formatDateTime } from '@/utils'

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

function EditorPage() {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const documentId = searchParams.get('documentId')
	const [editorLoadState, setEditorLoadState] = useState<EditorLoadState>({
		status: 'loading',
	})
	const commandBridgeStatus = useAppStore((state) => state.commandBridgeStatus)
	const isEditorReady = useEditorStore((state) => state.isEditorReady)
	const saveStatus = useEditorStore((state) => state.saveStatus)
	const lastSceneUpdatedAt = useEditorStore((state) => state.lastSceneUpdatedAt)
	const lastSceneElementCount = useEditorStore((state) => state.lastSceneElementCount)
	const setActiveDocumentId = useEditorStore((state) => state.setActiveDocumentId)
	const setEditorReady = useEditorStore((state) => state.setEditorReady)
	const setSaveStatus = useEditorStore((state) => state.setSaveStatus)
	const latestApiIdRef = useRef<string | null>(null)
	const [renameDraft, setRenameDraft] = useState('')
	const [isRenaming, setIsRenaming] = useState(false)

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
			setActiveDocumentId(null)
			setSaveStatus('idle')
		}
	}, [documentId, setActiveDocumentId, setSaveStatus])

	useEffect(() => {
		if (editorLoadState.status !== 'ready') {
			return
		}

		setActiveDocumentId(editorLoadState.document.id)
		setSaveStatus('saved')
	}, [editorLoadState, setActiveDocumentId, setSaveStatus])

	useEffect(() => {
		if (editorLoadState.status !== 'ready') {
			return
		}

		setRenameDraft(editorLoadState.document.title)
	}, [editorLoadState])

	const initialData = useMemo(() => {
		if (editorLoadState.status !== 'ready') {
			return null
		}

		return createInitialSceneData(editorLoadState.scene)
	}, [editorLoadState])

	const handleSceneChange = useCallback(
		(...args: ExcalidrawChangeArgs) => {
			if (editorLoadState.status !== 'ready') {
				return
			}

			const [elements, appState, files] = args
			observeSceneChange(
				editorLoadState.document.id,
				elements,
				appState,
				files,
				editorLoadState.document.title,
			)
		},
		[editorLoadState],
	)

	const handleApiReady = useCallback(
		(api: ExcalidrawImperativeAPI) => {
			if (!setEditorApi(api)) {
				return
			}

			latestApiIdRef.current = api.id

			// Excalidraw 会在自身初始化阶段触发这个回调，这里延后同步到外部 store，避免在未挂载阶段触发 React 更新。
			queueMicrotask(() => {
				if (latestApiIdRef.current === api.id) {
					setEditorReady(true)
				}
			})
		},
		[setEditorReady],
	)

	function handleInspectScene() {
		const currentScene = readActiveScene()

		if (!currentScene) {
			return
		}

		console.info('[StoneDraw][editor.page] 当前 scene 读取成功。', currentScene)
	}

	async function handleRenameDocument() {
		if (editorLoadState.status !== 'ready') {
			return
		}

		const normalizedTitle = renameDraft.trim()

		if (!normalizedTitle) {
			toast.error('标题不能为空。')
			return
		}

		setIsRenaming(true)

		const result = await documentService.rename(editorLoadState.document.id, normalizedTitle)

		setIsRenaming(false)

		if (!result.ok) {
			toast.error(result.error.message)
			return
		}

		setEditorLoadState((currentState) => {
			if (currentState.status !== 'ready') {
				return currentState
			}

			return {
				...currentState,
				document: result.data,
			}
		})
		setRenameDraft(result.data.title)
		toast.success('文档标题已更新。')
	}

	if (editorLoadState.status === 'loading') {
		return (
			<LoadingState
				title='正在加载文档'
				description='先读取文档元数据，再加载当前 scene 文件。'
			/>
		)
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

	const activeDocument = editorLoadState.document

	return (
		<section className='grid gap-4 xl:grid-cols-[19rem_minmax(0,1fr)]'>
			<aside className='flex flex-col gap-4 rounded-[1.75rem] border border-border/70 bg-background/85 p-4 shadow-sm'>
				<div className='flex flex-col gap-2'>
					<span className='w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold tracking-[0.16em] text-primary uppercase'>
						{APP_STATUS_BADGE}
					</span>
					<div className='flex flex-col gap-1'>
						<h2 className='text-lg font-semibold tracking-tight'>{activeDocument.title}</h2>
						<p className='text-sm leading-6 text-muted-foreground'>
							当前画布数据已经来自真实文档目录与 `current.scene.json`，不再使用前端草稿占位。
						</p>
					</div>
				</div>

				<div className='rounded-2xl border border-border/70 bg-card px-4 py-3'>
					<p className='text-xs font-medium text-muted-foreground'>文档标题</p>
					<div className='mt-3 flex flex-col gap-3'>
						<Input
							value={renameDraft}
							maxLength={120}
							disabled={isRenaming}
							onChange={(event) => {
								setRenameDraft(event.target.value)
							}}
							placeholder='输入新的文档标题'
						/>
						<div className='flex flex-wrap gap-2'>
							<Button
								type='button'
								size='sm'
								disabled={isRenaming}
								onClick={() => {
									void handleRenameDocument()
								}}>
								<PencilLineIcon data-icon='inline-start' />
								{isRenaming ? '正在保存标题' : '更新标题'}
							</Button>
							<Button
								type='button'
								size='sm'
								variant='outline'
								disabled={isRenaming}
								onClick={() => {
									setRenameDraft(activeDocument.title)
								}}>
								恢复当前标题
							</Button>
						</div>
					</div>
				</div>

				<div className='grid gap-3'>
					<div className='rounded-2xl border border-border/70 bg-card px-4 py-3'>
						<div className='flex items-center gap-2 text-xs font-medium text-muted-foreground'>
							<FileSearchIcon />
							文档 ID
						</div>
						<p className='mt-2 break-all text-sm font-medium'>{activeDocument.id}</p>
					</div>
					<div className='rounded-2xl border border-border/70 bg-card px-4 py-3'>
						<div className='flex items-center gap-2 text-xs font-medium text-muted-foreground'>
							<PenToolIcon />
							编辑器状态
						</div>
						<p className='mt-2 text-sm font-medium'>{isEditorReady ? '已就绪' : '初始化中'}</p>
					</div>
					<div className='rounded-2xl border border-border/70 bg-card px-4 py-3'>
						<div className='flex items-center gap-2 text-xs font-medium text-muted-foreground'>
							<DatabaseZapIcon />
							桥接 / 保存
						</div>
						<div className='mt-2 grid gap-1 text-sm'>
							<p className='font-medium'>命令桥接：{commandBridgeStatus}</p>
							<p className='text-muted-foreground'>保存状态：{saveStatus}</p>
						</div>
					</div>
					<div className='rounded-2xl border border-border/70 bg-card px-4 py-3 text-sm'>
						<p className='text-xs font-medium text-muted-foreground'>scene 文件</p>
						<p className='mt-2 break-all font-medium'>{activeDocument.currentScenePath}</p>
						<p className='mt-1 text-muted-foreground'>最近更新时间：{formatDateTime(activeDocument.updatedAt)}</p>
					</div>
					<div className='rounded-2xl border border-border/70 bg-card px-4 py-3 text-sm'>
						<p className='text-xs font-medium text-muted-foreground'>Scene 监听</p>
						<p className='mt-2 font-medium'>元素数：{lastSceneElementCount}</p>
						<p className='mt-1 text-muted-foreground'>
							最近变更：{lastSceneUpdatedAt ? formatDateTime(lastSceneUpdatedAt) : '尚未变更'}
						</p>
					</div>
				</div>

				<Button
					type='button'
					variant='outline'
					onClick={handleInspectScene}>
					<FileSearchIcon data-icon='inline-start' />
					读取当前 Scene
				</Button>
			</aside>

			<div className='overflow-hidden rounded-[1.75rem] border border-border/70 bg-background/85 shadow-sm'>
				<div className='h-[72vh] min-h-152 [&_.App-menu_top]:rounded-none [&_.excalidraw]:h-full'>
					<Excalidraw
						excalidrawAPI={handleApiReady}
						initialData={initialData ?? undefined}
						langCode='zh-CN'
						onChange={handleSceneChange}
						theme='light'
					/>
				</div>
			</div>
		</section>
	)
}

export default EditorPage
