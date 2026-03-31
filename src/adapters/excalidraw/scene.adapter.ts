import { CaptureUpdateAction } from '@excalidraw/excalidraw'
import type {
	AppState,
	BinaryFiles,
	ExcalidrawImperativeAPI,
	ExcalidrawInitialDataState,
} from '@excalidraw/excalidraw/types'
import { toIsoString } from '@/utils'
import type { SceneFilePayload } from '@/types'

export type ExcalidrawSceneSnapshot = {
	elements: NonNullable<ExcalidrawInitialDataState['elements']>
	appState: AppState
	files: BinaryFiles
}

// 当前版本只做最小桥接，scene 内容先按 Excalidraw 原始结构透传保存到应用层占位对象。
export function createScenePayload(
	documentId: string,
	elements: NonNullable<ExcalidrawInitialDataState['elements']>,
	appState: AppState,
	files: BinaryFiles,
): SceneFilePayload {
	return {
		documentId,
		version: 1,
		elements,
		appState: appState as unknown as Record<string, unknown>,
		files: files as unknown as Record<string, unknown>,
		updatedAt: toIsoString(),
	}
}

export function createInitialSceneData(scene: SceneFilePayload): ExcalidrawInitialDataState {
	return {
		elements: scene.elements as ExcalidrawInitialDataState['elements'],
		appState: scene.appState as ExcalidrawInitialDataState['appState'],
		files: scene.files as BinaryFiles,
	}
}

export function readSceneFromApi(api: ExcalidrawImperativeAPI, documentId: string): SceneFilePayload {
	return createScenePayload(documentId, api.getSceneElements(), api.getAppState(), api.getFiles())
}

export function applySceneToApi(api: ExcalidrawImperativeAPI, scene: SceneFilePayload) {
	api.updateScene({
		elements: scene.elements as Parameters<ExcalidrawImperativeAPI['updateScene']>[0]['elements'],
		appState: scene.appState as Parameters<ExcalidrawImperativeAPI['updateScene']>[0]['appState'],
		captureUpdate: CaptureUpdateAction.NEVER,
	})
}
