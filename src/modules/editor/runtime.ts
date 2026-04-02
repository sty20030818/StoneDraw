import type {
	AppState,
	BinaryFiles,
	ExcalidrawImperativeAPI,
	ExcalidrawInitialDataState,
} from '@excalidraw/excalidraw/types'
import { applySceneToApi, createSceneFingerprint, readSceneFromApi, serializeScene } from '@/adapters/excalidraw'
import { useEditorStore } from '@/stores'
import { logger } from '@/utils'
import type { SceneFilePayload } from '@/types'

let currentEditorApi: ExcalidrawImperativeAPI | null = null
let savedSceneFingerprint: string | null = null
let currentSceneFingerprint: string | null = null

function updateSceneRuntimeState(scene: SceneFilePayload, saveStatus: 'dirty' | 'saved') {
	const editorStore = useEditorStore.getState()

	editorStore.setLastSceneUpdatedAt(scene.updatedAt)
	editorStore.setLastSceneElementCount(scene.scene.elements.length)
	editorStore.setSaveStatus(saveStatus)
}

function updateCurrentSceneFingerprint(scene: SceneFilePayload) {
	currentSceneFingerprint = createSceneFingerprint(scene)
	return currentSceneFingerprint
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
	savedSceneFingerprint = null
	currentSceneFingerprint = null
	useEditorStore.getState().setEditorReady(false)
}

export function getEditorApi() {
	return currentEditorApi
}

export function readActiveScene(documentId?: string, title?: string): SceneFilePayload | null {
	const activeDocumentId = documentId ?? useEditorStore.getState().activeDocumentId

	if (!currentEditorApi || !activeDocumentId) {
		return null
	}

	return readSceneFromApi(currentEditorApi, activeDocumentId, title)
}

export function applyScene(scene: SceneFilePayload): boolean {
	if (!currentEditorApi) {
		return false
	}

	applySceneToApi(currentEditorApi, scene)
	markSceneAsSaved(scene)
	return true
}

export function setSceneObservationBaseline(scene: SceneFilePayload) {
	const fingerprint = createSceneFingerprint(scene)

	savedSceneFingerprint = fingerprint
	currentSceneFingerprint = fingerprint
	updateSceneRuntimeState(scene, 'saved')
}

export function markSceneAsSaved(scene: SceneFilePayload, updatedAt = scene.updatedAt) {
	const savedScene = {
		...scene,
		updatedAt,
	}
	const fingerprint = createSceneFingerprint(savedScene)

	savedSceneFingerprint = fingerprint
	currentSceneFingerprint = fingerprint
	updateSceneRuntimeState(savedScene, 'saved')
}

export function hasUnsavedSceneChanges() {
	return Boolean(savedSceneFingerprint && currentSceneFingerprint && savedSceneFingerprint !== currentSceneFingerprint)
}

export function observeSceneChange(
	documentId: string,
	elements: NonNullable<ExcalidrawInitialDataState['elements']>,
	appState: AppState,
	files: BinaryFiles,
	title?: string,
): SceneFilePayload {
	const scene =
		readActiveScene(documentId, title) ??
		serializeScene(
			documentId,
			{
				elements,
				appState,
				files,
			},
			{ title },
		)
	const nextFingerprint = updateCurrentSceneFingerprint(scene)
	const nextSaveStatus = savedSceneFingerprint === nextFingerprint ? 'saved' : 'dirty'

	updateSceneRuntimeState(scene, nextSaveStatus)

	logger.info('editor.runtime', '画布变更已同步到应用层。', {
		documentId,
		elementCount: scene.scene.elements.length,
		saveStatus: nextSaveStatus,
	})

	return scene
}
