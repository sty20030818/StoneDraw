import type {
	AppState,
	BinaryFiles,
	ExcalidrawImperativeAPI,
	ExcalidrawInitialDataState,
} from '@excalidraw/excalidraw/types'
import { createScenePayload, applySceneToApi, readSceneFromApi } from '@/adapters/excalidraw'
import { useEditorStore } from '@/stores'
import { logger } from '@/utils'
import type { SceneFilePayload } from '@/types'

let currentEditorApi: ExcalidrawImperativeAPI | null = null
let currentSceneFingerprint: string | null = null

function createSceneFingerprint(elements: NonNullable<ExcalidrawInitialDataState['elements']>, files: BinaryFiles) {
	return JSON.stringify({
		elements,
		fileIds: Object.keys(files).sort(),
	})
}

export function setEditorApi(api: ExcalidrawImperativeAPI) {
	if (currentEditorApi?.id === api.id) {
		return false
	}

	currentEditorApi = api
	logger.info('editor.runtime', 'Excalidraw API 已就绪。', {
		apiId: api.id,
	})

	return true
}

export function clearEditorApi() {
	currentEditorApi = null
	currentSceneFingerprint = null
	useEditorStore.getState().setEditorReady(false)
}

export function getEditorApi() {
	return currentEditorApi
}

export function readActiveScene(): SceneFilePayload | null {
	const activeDocumentId = useEditorStore.getState().activeDocumentId

	if (!currentEditorApi || !activeDocumentId) {
		return null
	}

	return readSceneFromApi(currentEditorApi, activeDocumentId)
}

export function applyScene(scene: SceneFilePayload): boolean {
	if (!currentEditorApi) {
		return false
	}

	applySceneToApi(currentEditorApi, scene)
	currentSceneFingerprint = createSceneFingerprint(
		scene.scene.elements as NonNullable<ExcalidrawInitialDataState['elements']>,
		scene.scene.files as BinaryFiles,
	)
	useEditorStore.getState().setLastSceneUpdatedAt(scene.updatedAt)
	useEditorStore.getState().setLastSceneElementCount(scene.scene.elements.length)

	return true
}

export function setSceneObservationBaseline(scene: SceneFilePayload) {
	currentSceneFingerprint = createSceneFingerprint(
		scene.scene.elements as NonNullable<ExcalidrawInitialDataState['elements']>,
		scene.scene.files as BinaryFiles,
	)
	useEditorStore.getState().setLastSceneElementCount(scene.scene.elements.length)
}

export function observeSceneChange(
	documentId: string,
	elements: NonNullable<ExcalidrawInitialDataState['elements']>,
	appState: AppState,
	files: BinaryFiles,
	title?: string,
): SceneFilePayload {
	const scene = createScenePayload(documentId, elements, appState, files, title)
	const editorStore = useEditorStore.getState()
	const nextFingerprint = createSceneFingerprint(elements, files)

	if (currentSceneFingerprint === nextFingerprint) {
		return scene
	}

	currentSceneFingerprint = nextFingerprint

	editorStore.setLastSceneUpdatedAt(scene.updatedAt)
	editorStore.setLastSceneElementCount(elements.length)
	editorStore.setSaveStatus('dirty')

	logger.info('editor.runtime', '画布变更已同步到应用层占位通道。', {
		documentId,
		elementCount: elements.length,
	})

	return scene
}
