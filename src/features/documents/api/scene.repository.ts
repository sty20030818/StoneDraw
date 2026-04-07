import { TAURI_COMMANDS } from '@/shared/constants'
import { invokeTauriCommand } from '@/platform/tauri'
import type { DocumentMeta, SceneFilePayload, TauriCommandResult } from '@/shared/types'
import { normalizeDocumentMetaResult, type RawDocumentMeta } from '../model'

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
		const result = await invokeTauriCommand<RawDocumentMeta>(
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

		return normalizeDocumentMetaResult(result)
	},
}
