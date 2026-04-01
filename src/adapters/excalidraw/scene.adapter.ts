import type {
	AppState,
	BinaryFiles,
	ExcalidrawImperativeAPI,
	ExcalidrawInitialDataState,
} from '@excalidraw/excalidraw/types'
import { toTimestamp } from '@/utils'
import type { SceneFilePayload } from '@/types'

const CAPTURE_UPDATE_NEVER = 0 as unknown as Parameters<ExcalidrawImperativeAPI['updateScene']>[0]['captureUpdate']

export type ExcalidrawSceneSnapshot = {
	elements: NonNullable<ExcalidrawInitialDataState['elements']>
	appState: AppState
	files: BinaryFiles
}

export function createScenePayload(
	documentId: string,
	elements: NonNullable<ExcalidrawInitialDataState['elements']>,
	appState: AppState,
	files: BinaryFiles,
	title = '未命名文档',
): SceneFilePayload {
	return {
		documentId,
		schemaVersion: 1,
		updatedAt: toTimestamp(),
		scene: {
			elements,
			appState: appState as unknown as Record<string, unknown>,
			files: files as unknown as Record<string, unknown>,
		},
		meta: {
			title,
			tags: [],
			textIndex: '',
		},
	}
}

export function createInitialSceneData(scene: SceneFilePayload): ExcalidrawInitialDataState {
	return {
		elements: scene.scene.elements as ExcalidrawInitialDataState['elements'],
		appState: scene.scene.appState as ExcalidrawInitialDataState['appState'],
		files: scene.scene.files as BinaryFiles,
	}
}

export function readSceneFromApi(api: ExcalidrawImperativeAPI, documentId: string, title?: string): SceneFilePayload {
	return createScenePayload(documentId, api.getSceneElements(), api.getAppState(), api.getFiles(), title)
}

export function applySceneToApi(api: ExcalidrawImperativeAPI, scene: SceneFilePayload) {
	api.updateScene({
		elements: scene.scene.elements as Parameters<ExcalidrawImperativeAPI['updateScene']>[0]['elements'],
		appState: scene.scene.appState as Parameters<ExcalidrawImperativeAPI['updateScene']>[0]['appState'],
		captureUpdate: CAPTURE_UPDATE_NEVER,
	})
}
