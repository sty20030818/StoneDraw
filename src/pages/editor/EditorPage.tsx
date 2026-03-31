import type { ComponentProps } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Excalidraw } from '@excalidraw/excalidraw'
import '@excalidraw/excalidraw/index.css'
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types'
import { DatabaseZapIcon, FileSearchIcon, PenToolIcon } from 'lucide-react'
import { createInitialSceneData } from '@/adapters/excalidraw'
import { APP_STATUS_BADGE } from '@/constants'
import { Button } from '@/components/ui/button'
import { clearEditorApi, observeSceneChange, readActiveScene, setEditorApi } from '@/modules/editor'
import { documentService, editorService } from '@/services'
import { useAppStore, useEditorStore } from '@/stores'

type ExcalidrawOnChange = NonNullable<ComponentProps<typeof Excalidraw>['onChange']>
type ExcalidrawChangeArgs = Parameters<ExcalidrawOnChange>

function createEditorBootstrapPayload() {
	const draftResult = documentService.createDraft('画板草稿')
	if (!draftResult.ok) {
		throw new Error(draftResult.error.message)
	}

	const draftDocument = draftResult.data
	const initialSceneResult = editorService.createEmptyScene(draftDocument.id)
	if (!initialSceneResult.ok) {
		throw new Error(initialSceneResult.error.message)
	}

	return {
		document: draftDocument,
		scene: initialSceneResult.data,
	}
}

function EditorPage() {
	const [{ document, scene }] = useState(createEditorBootstrapPayload)
	const commandBridgeStatus = useAppStore((state) => state.commandBridgeStatus)
	const isEditorReady = useEditorStore((state) => state.isEditorReady)
	const saveStatus = useEditorStore((state) => state.saveStatus)
	const lastSceneUpdatedAt = useEditorStore((state) => state.lastSceneUpdatedAt)
	const lastSceneElementCount = useEditorStore((state) => state.lastSceneElementCount)
	const setActiveDocumentId = useEditorStore((state) => state.setActiveDocumentId)
	const setEditorReady = useEditorStore((state) => state.setEditorReady)
	const setSaveStatus = useEditorStore((state) => state.setSaveStatus)
	const initialData = useMemo(() => createInitialSceneData(scene), [scene])
	const latestApiIdRef = useRef<string | null>(null)

	const handleSceneChange = useCallback(
		(...args: ExcalidrawChangeArgs) => {
			const [elements, appState, files] = args
			observeSceneChange(document.id, elements, appState, files)
		},
		[document.id],
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

	useEffect(() => {
		setActiveDocumentId(document.id)
		setSaveStatus('saved')

		return () => {
			clearEditorApi()
			setActiveDocumentId(null)
		}
	}, [document.id, setActiveDocumentId, setSaveStatus])

	function handleInspectScene() {
		const currentScene = readActiveScene()

		if (!currentScene) {
			return
		}

		console.info('[StoneDraw][editor.page] 当前 scene 占位读取成功。', currentScene)
	}

	return (
		<section className='grid gap-4 xl:grid-cols-[19rem_minmax(0,1fr)]'>
			<aside className='flex flex-col gap-4 rounded-[1.75rem] border border-border/70 bg-background/85 p-4 shadow-sm'>
				<div className='flex flex-col gap-2'>
					<span className='w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold tracking-[0.16em] text-primary uppercase'>
						{APP_STATUS_BADGE}
					</span>
					<div className='flex flex-col gap-1'>
						<h2 className='text-lg font-semibold tracking-tight'>{document.title}</h2>
						<p className='text-sm leading-6 text-muted-foreground'>
							Excalidraw 已接进应用路由壳，保存、导出和文档持久化会继续叠加在这个页面。
						</p>
					</div>
				</div>

				<div className='grid gap-3'>
					<div className='rounded-2xl border border-border/70 bg-card px-4 py-3'>
						<div className='flex items-center gap-2 text-xs font-medium text-muted-foreground'>
							<FileSearchIcon />
							文档 ID
						</div>
						<p className='mt-2 break-all text-sm font-medium'>{document.id}</p>
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
						<p className='text-xs font-medium text-muted-foreground'>Scene 监听</p>
						<p className='mt-2 font-medium'>元素数：{lastSceneElementCount}</p>
						<p className='mt-1 text-muted-foreground'>最近变更：{lastSceneUpdatedAt ?? '尚未变更'}</p>
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
						initialData={initialData}
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
