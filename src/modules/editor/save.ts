import { editorService } from '@/services/editor.service'
import { createFailureResult, createSuccessResult } from '@/services/tauri.service'
import type { DocumentMeta, SceneFilePayload, TauriCommandResult } from '@/types/index'
import { readActiveScene } from './runtime'

export type SaveSceneSuccessPayload = {
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

export async function saveActiveDocumentScene(
	document: Pick<DocumentMeta, 'id' | 'title'>,
): Promise<TauriCommandResult<SaveSceneSuccessPayload>> {
	// Excalidraw 在失焦、文本确认等交互结束时可能延后一帧才提交最终 scene。
	// 手动保存前先等待当前交互收尾，避免“已点击保存但最后一次改动没进快照”。
	await waitForEditorCommit()

	const scene = readActiveScene(document.id, document.title)

	if (!scene) {
		return createFailureResult({
			code: 'INVALID_ARGUMENT',
			message: '当前编辑器尚未准备好，无法执行保存',
			details: `documentId=${document.id}`,
		}) as TauriCommandResult<SaveSceneSuccessPayload>
	}

	const saveResult = await editorService.saveScene(scene)

	if (!saveResult.ok) {
		return saveResult as TauriCommandResult<SaveSceneSuccessPayload>
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
