import { TAURI_COMMANDS } from '@/shared/constants'
import { invokeTauriCommand } from '@/platform/tauri'
import type { DocumentMeta, SceneFilePayload, TauriCommandResult } from '@/shared/types'

export const sceneRepository = {
	async readCurrent(documentId: string, correlationId?: string): Promise<TauriCommandResult<SceneFilePayload>> {
		return invokeTauriCommand<SceneFilePayload>(
			TAURI_COMMANDS.DOCUMENTS_OPEN_SCENE,
			{
				documentId,
			},
			{
				module: 'scene-repository',
				operation: 'readCurrent',
				layer: 'repository',
				objectId: documentId,
				correlationId,
			},
		)
	},

	async saveCurrent(scene: SceneFilePayload, correlationId?: string): Promise<TauriCommandResult<DocumentMeta>> {
		return invokeTauriCommand<DocumentMeta>(
			TAURI_COMMANDS.EDITOR_SAVE_SCENE,
			{
				scene,
			},
			{
				module: 'scene-repository',
				operation: 'saveCurrent',
				layer: 'repository',
				objectId: scene.documentId,
				correlationId,
			},
		)
	},
}
