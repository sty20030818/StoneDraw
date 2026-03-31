import type { ComponentProps } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Excalidraw } from '@excalidraw/excalidraw'
import '@excalidraw/excalidraw/index.css'
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types'
import { createInitialSceneData } from '@/adapters/excalidraw'
import { APP_STATUS_BADGE } from '@/constants'
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

	const handleSceneChange = useCallback((...args: ExcalidrawChangeArgs) => {
		const [elements, appState, files] = args
		observeSceneChange(document.id, elements, appState, files)
	}, [document.id])

	const handleApiReady = useCallback((api: ExcalidrawImperativeAPI) => {
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
	}, [setEditorReady])

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
		<main className='editor-page'>
			<header className='editor-header'>
				<div>
					<span className='editor-badge'>{APP_STATUS_BADGE}</span>
					<h1>{document.title}</h1>
					<p>Excalidraw 已接入当前应用入口，后续保存与文档系统将在这个编辑器页基础上继续叠加。</p>
				</div>

				<div className='editor-actions'>
					<button
						className='editor-action-button'
						type='button'
						onClick={handleInspectScene}>
						读取当前 Scene
					</button>
				</div>
			</header>

			<section
				className='editor-meta-grid'
				aria-label='编辑器状态'>
				<div className='editor-meta-card'>
					<span>文档 ID</span>
					<strong>{document.id}</strong>
				</div>
				<div className='editor-meta-card'>
					<span>编辑器状态</span>
					<strong>{isEditorReady ? '已就绪' : '初始化中'}</strong>
				</div>
				<div className='editor-meta-card'>
					<span>命令桥接</span>
					<strong>{commandBridgeStatus}</strong>
				</div>
				<div className='editor-meta-card'>
					<span>保存状态</span>
					<strong>{saveStatus}</strong>
				</div>
				<div className='editor-meta-card'>
					<span>画布元素数</span>
					<strong>{lastSceneElementCount}</strong>
				</div>
				<div className='editor-meta-card'>
					<span>最近变更</span>
					<strong>{lastSceneUpdatedAt ?? '尚未变更'}</strong>
				</div>
			</section>

			<section className='editor-stage'>
				<Excalidraw
					excalidrawAPI={handleApiReady}
					initialData={initialData}
					langCode='zh-CN'
					onChange={handleSceneChange}
					theme='light'
				/>
			</section>
		</main>
	)
}

export default EditorPage
