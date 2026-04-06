import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types'
import { applySceneToApi, createInitialSceneData, readSceneFromApi } from '@/adapters/excalidraw'
import { logger } from '@/infra/logging'
import type { SceneFilePayload } from '@/types'

let currentEditorApi: ExcalidrawImperativeAPI | null = null

export function setEditorApi(api: ExcalidrawImperativeAPI) {
	if (currentEditorApi?.id === api.id) {
		return false
	}

	currentEditorApi = api
	logger.info({
		layer: 'service',
		module: 'editor-runtime',
		operation: 'setEditorApi',
		correlationId: `editor-api-${api.id}`,
		message: 'Excalidraw API 已就绪。',
		context: {
			apiId: api.id,
		},
	})

	return true
}

export function clearEditorApi() {
	currentEditorApi = null
}

export function getEditorApi() {
	return currentEditorApi
}

export function readActiveScene(documentId?: string, title?: string): SceneFilePayload | null {
	if (!currentEditorApi || !documentId) {
		return null
	}

	return readSceneFromApi(currentEditorApi, documentId, title)
}

export function applyScene(scene: SceneFilePayload): boolean {
	if (!currentEditorApi) {
		return false
	}

	applySceneToApi(currentEditorApi, scene)
	return true
}

export function createEditorInitialData(scene: SceneFilePayload) {
	return createInitialSceneData(scene)
}
