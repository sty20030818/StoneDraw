import { describe, expect, test, vi } from 'vitest'
import { createEditorEventBridge } from './editor-event-bridge'

describe('workbench.editor-event-bridge', () => {
	test('应将 Excalidraw 原始变更收口为稳定 payload', () => {
		const onContentChange = vi.fn()
		const bridge = createEditorEventBridge({
			onContentChange,
		})

		bridge.handleContentChange([{ id: 'element-1' }], { viewBackgroundColor: '#fff' } as never, {
			'file-1': { id: 'file-1' },
		} as never)

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
