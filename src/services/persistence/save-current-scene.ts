import { editorService } from '@/services/workbench/editor.service'
import { createFailureResult, createSuccessResult } from '@/services/tauri.service'
import type { DocumentMeta, SceneFilePayload, TauriCommandResult } from '@/types/index'
import { readActiveScene } from '@/workbench/editor-runtime'

export type SaveCurrentSceneSuccessPayload = {
	document: DocumentMeta
	scene: SceneFilePayload
}

function waitForEditorCommit() {
	return new Promise<void>((resolve) => {
		requestAnimationFrame(() => {
			resolve()
		})
	})
}

export async function saveCurrentDocumentScene(
	document: Pick<DocumentMeta, 'id' | 'title'>,
): Promise<TauriCommandResult<SaveCurrentSceneSuccessPayload>> {
	// Excalidraw 在失焦、文本确认等交互结束时可能延后一帧才提交最终 scene。
	// 手动保存前先等待当前交互收尾，避免“已点击保存但最后一次改动没进快照”。
	await waitForEditorCommit()

	const scene = readActiveScene(document.id, document.title)

	if (!scene) {
		return createFailureResult({
			code: 'INVALID_ARGUMENT',
			message: '当前编辑器尚未准备好，无法执行保存',
			layer: 'service',
			module: 'save-current-scene',
			operation: 'saveCurrentDocumentScene',
			correlationId: `save-active-scene-${document.id}`,
			details: `documentId=${document.id}`,
			objectId: document.id,
		}) as TauriCommandResult<SaveCurrentSceneSuccessPayload>
	}

	const saveResult = await editorService.saveScene(scene)

	if (!saveResult.ok) {
		return saveResult as TauriCommandResult<SaveCurrentSceneSuccessPayload>
	}

	const savedScene = {
		...scene,
		updatedAt: saveResult.data.updatedAt,
		meta: {
			...scene.meta,
			title: saveResult.data.title,
		},
	}

	return createSuccessResult({
		document: saveResult.data,
		scene: savedScene,
	})
}
