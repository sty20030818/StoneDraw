import type { BinaryFiles, ExcalidrawInitialDataState } from '@excalidraw/excalidraw/types'
import { describe, expect, test, vi } from 'vitest'
import { createEditorEventBridge } from './editor-event-bridge'

describe('workbench.editor-event-bridge', () => {
	test('应将 Excalidraw 原始变更收口为稳定 payload', () => {
		const onContentChange = vi.fn<(payload: unknown) => void>()
		const bridge = createEditorEventBridge({
			onContentChange,
		})
		const elements = [{ id: 'element-1' }] as unknown as NonNullable<ExcalidrawInitialDataState['elements']>
		const files = {
			'file-1': { id: 'file-1' },
		} as unknown as BinaryFiles

		bridge.handleContentChange(
			elements,
			{ viewBackgroundColor: '#fff' } as never,
			files,
		)

		expect(onContentChange).toHaveBeenCalledTimes(1)
		expect(onContentChange).toHaveBeenCalledWith({
			elements: [{ id: 'element-1' }],
			appState: { viewBackgroundColor: '#fff' },
			files: {
				'file-1': { id: 'file-1' },
			},
		})
	})
})
