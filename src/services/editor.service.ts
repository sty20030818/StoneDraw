import { TAURI_COMMANDS } from '@/constants'
import { deserializeScene, serializeScene, SceneValidationError } from '@/adapters/excalidraw'
import type { DocumentMeta, SceneFilePayload, TauriCommandResult } from '@/types'
import { createFailureResult, createSuccessResult, invokeTauriCommand } from './tauri.service'

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
		const loadResult = await invokeTauriCommand<SceneFilePayload>(TAURI_COMMANDS.DOCUMENTS_OPEN_SCENE, {
			documentId,
		})

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
				details,
				command: TAURI_COMMANDS.DOCUMENTS_OPEN_SCENE,
			}) as TauriCommandResult<SceneFilePayload>
		}
	},
	async saveScene(payload: SceneFilePayload): Promise<TauriCommandResult<DocumentMeta>> {
		try {
			const normalizedPayload = deserializeScene(payload, {
				expectedDocumentId: payload.documentId,
				fallbackTitle: payload.meta.title,
			})

			return invokeTauriCommand<DocumentMeta>(TAURI_COMMANDS.EDITOR_SAVE_SCENE, {
				scene: normalizedPayload,
			})
		} catch (error) {
			const details =
				error instanceof SceneValidationError || error instanceof Error ? error.message : 'scene 校验失败'

			return createFailureResult({
				code: 'INVALID_ARGUMENT',
				message: '当前 scene 数据无效，无法保存',
				details,
				command: TAURI_COMMANDS.EDITOR_SAVE_SCENE,
			}) as TauriCommandResult<DocumentMeta>
		}
	},
}
