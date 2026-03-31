import type { SceneFilePayload, TauriCommandResult } from '@/types'
import { toIsoString } from '@/utils'
import { createSuccessResult, invokeTauriCommand } from './tauri.service'

function createEmptyScene(documentId: string): SceneFilePayload {
	return {
		documentId,
		version: 1,
		elements: [],
		appState: {},
		files: {},
		updatedAt: toIsoString(),
	}
}

export const editorService = {
	createEmptyScene(documentId: string): TauriCommandResult<SceneFilePayload> {
		return createSuccessResult(createEmptyScene(documentId))
	},
	async loadScene(documentId: string): Promise<TauriCommandResult<SceneFilePayload>> {
		return invokeTauriCommand<SceneFilePayload>('editor_load_scene', { documentId })
	},
	async saveScene(payload: SceneFilePayload): Promise<TauriCommandResult<SceneFilePayload>> {
		return invokeTauriCommand<SceneFilePayload>('editor_save_scene', { payload })
	},
}
