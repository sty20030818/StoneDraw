import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types'

export type EditorAdapterBridge = {
	api: ExcalidrawImperativeAPI
}

// 编辑器桥接先保留为轻量适配器，后续统一承载 Excalidraw 与工作台状态同步。
export function connectEditorAdapter(api: ExcalidrawImperativeAPI): EditorAdapterBridge {
	return {
		api,
	}
}
