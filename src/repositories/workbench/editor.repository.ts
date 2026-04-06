import { TAURI_COMMANDS } from '@/constants'
import { invokeTauriCommand } from '@/infra/tauri'
import type { DocumentMeta, SceneFilePayload, TauriCommandResult } from '@/types'

export const editorRepository = {
	async openScene(documentId: string, correlationId?: string): Promise<TauriCommandResult<SceneFilePayload>> {
		return invokeTauriCommand<SceneFilePayload>(
			TAURI_COMMANDS.DOCUMENTS_OPEN_SCENE,
			{
				documentId,
			},
			{
				module: 'editor-repository',
				operation: 'openScene',
				layer: 'repository',
				objectId: documentId,
				correlationId,
			},
		)
	},

	async saveScene(scene: SceneFilePayload, correlationId?: string): Promise<TauriCommandResult<DocumentMeta>> {
		return invokeTauriCommand<DocumentMeta>(
			TAURI_COMMANDS.EDITOR_SAVE_SCENE,
			{
				scene,
			},
			{
				module: 'editor-repository',
				operation: 'saveScene',
				layer: 'repository',
				objectId: scene.documentId,
				correlationId,
			},
		)
	},
}
