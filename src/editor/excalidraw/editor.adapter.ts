import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types'

export type EditorAdapterBridge = {
	api: ExcalidrawImperativeAPI
}

// 编辑器桥接保持最小职责，只暴露当前工作台已经在用的 Excalidraw API 句柄。
export function connectEditorAdapter(api: ExcalidrawImperativeAPI): EditorAdapterBridge {
	return {
		api,
	}
}
