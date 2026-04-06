import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types'
import { applySceneToApi, createInitialSceneData, deserializeScene } from '@/adapters/excalidraw'
import { logger } from '@/platform/logging'
import type { SceneFilePayload } from '@/shared/types'

type NormalizeWorkbenchSceneOptions = {
	documentId: string
	title?: string
}

type NormalizeWorkbenchSceneResult = {
	scene: SceneFilePayload
	recoveredFromFallback: boolean
}

function createBlankScene(documentId: string, title = '未命名文档'): SceneFilePayload {
	return {
		documentId,
		schemaVersion: 1,
		updatedAt: Date.now(),
		scene: {
			elements: [],
			appState: {} as SceneFilePayload['scene']['appState'],
			files: {} as SceneFilePayload['scene']['files'],
		},
		meta: {
			title,
			tags: [],
			textIndex: '',
		},
	}
}

// 工作台恢复桥统一处理 scene 校验、空白兜底和应用，避免页面和宿主重复拼恢复逻辑。
export function normalizeWorkbenchScene(
	scene: SceneFilePayload,
	options: NormalizeWorkbenchSceneOptions,
): NormalizeWorkbenchSceneResult {
	try {
		return {
			scene: deserializeScene(scene, {
				expectedDocumentId: options.documentId,
				fallbackTitle: options.title,
			}),
			recoveredFromFallback: false,
		}
	} catch (error) {
		logger.warn({
			layer: 'service',
			module: 'workbench-scene-restore-bridge',
			operation: 'normalizeWorkbenchScene',
			objectId: options.documentId,
			correlationId: `workbench-scene-fallback-${options.documentId}`,
			message: '检测到损坏或不匹配的 scene，已回退到空白场景。',
			context: {
				documentId: options.documentId,
				error: error instanceof Error ? error.message : String(error),
			},
		})

		return {
			scene: createBlankScene(options.documentId, options.title),
			recoveredFromFallback: true,
		}
	}
}

export function createWorkbenchInitialSceneData(scene: SceneFilePayload) {
	return createInitialSceneData(scene)
}

export function restoreSceneToWorkbench(api: ExcalidrawImperativeAPI, scene: SceneFilePayload) {
	applySceneToApi(api, scene)
}
