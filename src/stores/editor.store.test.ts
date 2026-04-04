import { describe, expect, test } from 'vitest'
import { useEditorStore } from './editor.store'

describe('editor.store', () => {
	test('setSaveStatus 应支持 saved dirty saving error 四态切换', () => {
		const editorStore = useEditorStore.getState()

		editorStore.setSaveStatus('saved')
		expect(useEditorStore.getState().saveStatus).toBe('saved')

		editorStore.setSaveStatus('dirty')
		expect(useEditorStore.getState().saveStatus).toBe('dirty')

		editorStore.setSaveStatus('saving')
		expect(useEditorStore.getState().saveStatus).toBe('saving')

		editorStore.setSaveStatus('error')
		expect(useEditorStore.getState().saveStatus).toBe('error')
	})

	test('reset 应恢复编辑器运行态初始值', () => {
		const editorStore = useEditorStore.getState()

		editorStore.setActiveDocumentId('doc-store-1')
		editorStore.setEditorReady(true)
		editorStore.setSaveStatus('dirty')
		editorStore.setLastSaveError('保存失败')
		editorStore.setIsFlushing(true)
		editorStore.reset()

		expect(useEditorStore.getState()).toMatchObject({
			activeDocumentId: null,
			isEditorReady: false,
			saveStatus: 'idle',
			lastSaveError: null,
			isFlushing: false,
		})
	})
})
