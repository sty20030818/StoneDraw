import { TAURI_COMMANDS } from '@/constants'
import type { SceneFilePayload, TauriCommandResult } from '@/types'
import { toTimestamp } from '@/utils'
import { createFailureResult, createSuccessResult, invokeTauriCommand } from './tauri.service'

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
		return invokeTauriCommand<SceneFilePayload>(TAURI_COMMANDS.DOCUMENTS_OPEN_SCENE, {
			documentId,
		})
	},
	async saveScene(_payload: SceneFilePayload): Promise<TauriCommandResult<SceneFilePayload>> {
		return createFailureResult({
			code: 'UNIMPLEMENTED_COMMAND',
			message: '当前版本尚未实现 scene 保存命令',
			details: '0.2.3 只打通文档创建、打开与列表读取链路。',
			command: TAURI_COMMANDS.EDITOR_SAVE_SCENE,
		}) as TauriCommandResult<SceneFilePayload>
	},
}
