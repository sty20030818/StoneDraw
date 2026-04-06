import type { SceneFilePayload } from '@/shared/types'

export type ExportPlaceholderResult = {
	supported: false
	reason: string
	scene: SceneFilePayload
}

// 导出能力明确留给后续版本，这里只固定适配器位置和返回结构。
export function exportScenePlaceholder(scene: SceneFilePayload): ExportPlaceholderResult {
	return {
		supported: false,
		reason: '0.1.4 只接入编辑器运行时，不实现导出链路。',
		scene,
	}
}
