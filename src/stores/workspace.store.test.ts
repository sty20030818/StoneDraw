import { describe, expect, test } from 'vitest'
import { useWorkspaceStore } from './workspace.store'

describe('workspace.store', () => {
	test('setActiveSection 应更新工作区一级页面选择', () => {
		const workspaceStore = useWorkspaceStore.getState()

		workspaceStore.setActiveSection('documents')

		expect(useWorkspaceStore.getState()).toMatchObject({
			activeSection: 'documents',
		})
	})

	test('reset 应恢复工作区初始状态', () => {
		const workspaceStore = useWorkspaceStore.getState()

		workspaceStore.setActiveSection('settings')
		workspaceStore.reset()

		expect(useWorkspaceStore.getState()).toMatchObject({
			activeSection: 'home',
		})
	})
})
