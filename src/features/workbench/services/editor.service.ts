import { TAURI_COMMANDS } from '@/shared/constants/index'
import { deserializeScene, serializeScene, SceneValidationError } from '@/adapters/excalidraw/scene.adapter'
import { sceneRepository } from '@/repositories'
import { createFailureResult, createSuccessResult } from '@/platform/tauri'
import type { DocumentMeta, SceneFilePayload, TauriCommandResult } from '@/shared/types/index'

function createEmptyScene(documentId: string, title = '未命名文档'): SceneFilePayload {
	return serializeScene(
		documentId,
		{
			elements: [],
			appState: {} as never,
			files: {},
		},
		{ title },
	)
}

export const editorService = {
	createEmptyScene(documentId: string, title?: string): TauriCommandResult<SceneFilePayload> {
		return createSuccessResult(createEmptyScene(documentId, title))
	},
	async loadScene(documentId: string): Promise<TauriCommandResult<SceneFilePayload>> {
		const loadResult = await sceneRepository.readCurrent(documentId)

		if (!loadResult.ok) {
			return loadResult
		}

		try {
			return createSuccessResult(
				deserializeScene(loadResult.data, {
					expectedDocumentId: documentId,
				}),
			)
		} catch (error) {
			const details = error instanceof Error ? error.message : 'scene 校验失败'

			return createFailureResult({
				code: 'INVALID_ARGUMENT',
				message: '读取到的 scene 数据无效',
				layer: 'service',
				module: 'editor-service',
				operation: 'loadScene',
				correlationId: 'editor-load-scene-validation',
				details,
				command: TAURI_COMMANDS.DOCUMENTS_OPEN_SCENE,
				objectId: documentId,
			}) as TauriCommandResult<SceneFilePayload>
		}
	},
	async saveScene(payload: SceneFilePayload): Promise<TauriCommandResult<DocumentMeta>> {
		try {
			const normalizedPayload = deserializeScene(payload, {
				expectedDocumentId: payload.documentId,
				fallbackTitle: payload.meta.title,
			})

			return sceneRepository.saveCurrent(normalizedPayload)
		} catch (error) {
			const details =
				error instanceof SceneValidationError || error instanceof Error ? error.message : 'scene 校验失败'

			return createFailureResult({
				code: 'INVALID_ARGUMENT',
				message: '当前 scene 数据无效，无法保存',
				layer: 'service',
				module: 'editor-service',
				operation: 'saveScene',
				correlationId: 'editor-save-scene-validation',
				details,
				command: TAURI_COMMANDS.EDITOR_SAVE_SCENE,
				objectId: payload.documentId,
			}) as TauriCommandResult<DocumentMeta>
		}
	},
}
