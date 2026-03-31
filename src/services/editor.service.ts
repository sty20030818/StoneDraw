import { TAURI_COMMANDS } from '@/constants'
import type { SceneFilePayload, TauriCommandResult } from '@/types'
import { toTimestamp } from '@/utils'
import { createSuccessResult, invokeTauriCommand } from './tauri.service'

function createEmptyScene(documentId: string, title = '未命名文档'): SceneFilePayload {
	return {
		documentId,
		schemaVersion: 1,
		updatedAt: toTimestamp(),
		scene: {
			elements: [],
			appState: {},
			files: {},
		},
		meta: {
			title,
			tags: [],
			textIndex: '',
		},
	}
}

export const editorService = {
	createEmptyScene(documentId: string, title?: string): TauriCommandResult<SceneFilePayload> {
		return createSuccessResult(createEmptyScene(documentId, title))
	},
	async loadScene(documentId: string): Promise<TauriCommandResult<SceneFilePayload>> {
		return invokeTauriCommand<SceneFilePayload>(TAURI_COMMANDS.EDITOR_LOAD_SCENE, {
			documentId,
		})
	},
	async saveScene(payload: SceneFilePayload): Promise<TauriCommandResult<SceneFilePayload>> {
		return invokeTauriCommand<SceneFilePayload>(TAURI_COMMANDS.EDITOR_SAVE_SCENE, {
			payload,
		})
	},
}
