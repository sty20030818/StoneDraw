import type {
	AppState,
	BinaryFiles,
	ExcalidrawImperativeAPI,
	ExcalidrawInitialDataState,
} from '@excalidraw/excalidraw/types'
import { applySceneToApi, createSceneFingerprint, readSceneFromApi, serializeScene } from '@/adapters/excalidraw/index'
import { useEditorStore } from '@/stores/editor.store'
import { logger } from '@/utils/logger'
import type { SceneFilePayload } from '@/types/index'

let currentEditorApi: ExcalidrawImperativeAPI | null = null
let savedSceneFingerprint: string | null = null
let currentSceneFingerprint: string | null = null

function updateSceneRuntimeState(scene: SceneFilePayload, saveStatus: 'dirty' | 'saved' | 'saving') {
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
	const editorStore = useEditorStore.getState()
	editorStore.setEditorReady(false)
	editorStore.setHasPendingCompensationSave(false)
	editorStore.setHasScheduledSave(false)
	editorStore.setIsFlushing(false)
	editorStore.setLastSaveError(null)
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
	const editorStore = useEditorStore.getState()

	savedSceneFingerprint = fingerprint
	currentSceneFingerprint = fingerprint
	editorStore.setHasPendingCompensationSave(false)
	editorStore.setHasScheduledSave(false)
	editorStore.setLastSaveError(null)
	updateSceneRuntimeState(scene, 'saved')
}

export function markSceneAsSaved(scene: SceneFilePayload, updatedAt = scene.updatedAt) {
	const editorStore = useEditorStore.getState()
	const savedScene = {
		...scene,
		updatedAt,
	}
	const fingerprint = createSceneFingerprint(savedScene)

	savedSceneFingerprint = fingerprint
	editorStore.setLastSaveError(null)

	if (!currentSceneFingerprint) {
		currentSceneFingerprint = fingerprint
	}

	const nextSaveStatus = currentSceneFingerprint === fingerprint ? 'saved' : 'dirty'

	updateSceneRuntimeState(savedScene, nextSaveStatus)
}

export function markSceneAsSaveStarted(scene?: SceneFilePayload) {
	const nextScene = scene ?? readActiveScene()

	useEditorStore.getState().setLastSaveError(null)

	if (nextScene) {
		updateSceneRuntimeState(nextScene, 'saving')
		return
	}

	useEditorStore.getState().setSaveStatus('saving')
}

export function markSceneAsSaveFailed(details?: string) {
	const editorStore = useEditorStore.getState()

	editorStore.setLastSaveError(details ?? null)
	editorStore.setSaveStatus('error')
}

export function clearPendingCompensationSave() {
	useEditorStore.getState().setHasPendingCompensationSave(false)
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
	const editorStore = useEditorStore.getState()
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
	const hasUnsavedChanges = savedSceneFingerprint !== nextFingerprint
	const isSaving = editorStore.saveStatus === 'saving'
	const nextSaveStatus = hasUnsavedChanges ? (isSaving ? 'saving' : 'dirty') : 'saved'

	if (isSaving && hasUnsavedChanges) {
		editorStore.setHasPendingCompensationSave(true)
	}

	editorStore.setLastSaveError(null)

	updateSceneRuntimeState(scene, nextSaveStatus)

	logger.info('editor.runtime', '画布变更已同步到应用层。', {
		documentId,
		elementCount: scene.scene.elements.length,
		saveStatus: nextSaveStatus,
	})

	return scene
}
