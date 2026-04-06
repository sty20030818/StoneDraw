import type { ComponentProps } from 'react'
import { useEffect, useMemo, useRef } from 'react'
import { Excalidraw } from '@excalidraw/excalidraw'
import '@excalidraw/excalidraw/index.css'
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types'
import type { SceneFilePayload } from '@/shared/types'
import { createEditorEventBridge, type EditorContentChangePayload } from './editor-event-bridge'
import { clearEditorApi, setEditorApi } from './editor-runtime'
import { createWorkbenchInitialSceneData, restoreSceneToWorkbench } from './scene-restore-bridge'

type ExcalidrawHostProps = {
	scene: SceneFilePayload
	onContentChange?: (payload: EditorContentChangePayload) => void
	onReadyChange?: (isReady: boolean) => void
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

function ExcalidrawHost({ scene, onContentChange, onReadyChange }: ExcalidrawHostProps) {
	const apiRef = useRef<ExcalidrawImperativeAPI | null>(null)
	const lastAppliedSceneKeyRef = useRef<string | null>(null)
	const initialData = useMemo(() => createWorkbenchInitialSceneData(scene), [scene])
	const sceneRestoreKey = useMemo(() => `${scene.documentId}:${scene.updatedAt}`, [scene.documentId, scene.updatedAt])
	const eventBridge = useMemo(() => createEditorEventBridge({ onContentChange }), [onContentChange])

	useEffect(() => {
		const api = apiRef.current

		if (!api || lastAppliedSceneKeyRef.current === sceneRestoreKey) {
			return
		}

		restoreSceneToWorkbench(api, scene)
		lastAppliedSceneKeyRef.current = sceneRestoreKey
	}, [scene, sceneRestoreKey])

	useEffect(() => {
		return () => {
			clearEditorApi()
			onReadyChange?.(false)
		}
	}, [onReadyChange])

	return (
		<div className='h-full min-h-0 w-full [&_.App-menu_top]:rounded-none [&_.excalidraw]:h-full'>
			<Excalidraw
				UIOptions={EXCALIDRAW_UI_OPTIONS}
				excalidrawAPI={(api) => {
					apiRef.current = api
					setEditorApi(api)
					restoreSceneToWorkbench(api, scene)
					lastAppliedSceneKeyRef.current = sceneRestoreKey
					queueMicrotask(() => {
						onReadyChange?.(true)
					})
				}}
				initialData={initialData}
				langCode='zh-CN'
				onChange={(elements, appState, files) => {
					eventBridge.handleContentChange(elements, appState, files)
				}}
				renderTopRightUI={() => null}
				theme='light'
			/>
		</div>
	)
}

export default ExcalidrawHost
