import type { AppState, BinaryFiles, ExcalidrawInitialDataState } from '@excalidraw/excalidraw/types'

export type EditorContentChangePayload = {
	elements: NonNullable<ExcalidrawInitialDataState['elements']>
	appState: AppState
	files: BinaryFiles
}

type EditorEventBridgeOptions = {
	onContentChange?: (payload: EditorContentChangePayload) => void
}

// 编辑器事件桥统一收口 Excalidraw 原始事件，避免页面直接依赖底层回调签名。
export function createEditorEventBridge(options: EditorEventBridgeOptions) {
	return {
		handleContentChange(
			elements: NonNullable<ExcalidrawInitialDataState['elements']>,
			appState: AppState,
			files: BinaryFiles,
		) {
			options.onContentChange?.({
				elements,
				appState,
				files,
			})
		},
	}
}
