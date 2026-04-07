import { describe, expect, test } from 'vitest'
import { useWorkbenchStore } from './workbench.store'

describe('workbench.store', () => {
	test('setSaveStatus 应支持 saved dirty saving error 四态切换', () => {
		const workbenchStore = useWorkbenchStore.getState()

		workbenchStore.setSaveStatus('saved')
		expect(useWorkbenchStore.getState().saveStatus).toBe('saved')

		workbenchStore.setSaveStatus('dirty')
		expect(useWorkbenchStore.getState().saveStatus).toBe('dirty')

		workbenchStore.setSaveStatus('saving')
		expect(useWorkbenchStore.getState().saveStatus).toBe('saving')

		workbenchStore.setSaveStatus('error')
		expect(useWorkbenchStore.getState().saveStatus).toBe('error')
	})

	test('reset 应恢复工作台运行态初始值', () => {
		const workbenchStore = useWorkbenchStore.getState()

		workbenchStore.setActiveDocumentId('doc-store-1')
		workbenchStore.setWorkbenchReady(true)
		workbenchStore.setSaveStatus('dirty')
		workbenchStore.setLastSaveError('保存失败')
		workbenchStore.setIsFlushing(true)
		workbenchStore.reset()

		expect(useWorkbenchStore.getState()).toMatchObject({
			activeDocumentId: null,
			isWorkbenchReady: false,
			saveStatus: 'idle',
			lastSaveError: null,
			isFlushing: false,
		})
	})
})
