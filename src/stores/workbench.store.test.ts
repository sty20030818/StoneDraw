import { beforeEach, describe, expect, test } from 'vitest'
import { useWorkbenchStore } from './workbench.store'

describe('workbench.store', () => {
	beforeEach(() => {
		useWorkbenchStore.getState().reset()
	})

	test('syncDocumentTab 应写入 tab 并同步 activeDocumentId', () => {
		useWorkbenchStore.getState().syncDocumentTab({
			id: 'doc-tab-1',
			title: '文档一',
		})

		const state = useWorkbenchStore.getState()

		expect(state.tabs).toEqual([{ id: 'doc-tab-1', title: '文档一' }])
		expect(state.activeDocumentId).toBe('doc-tab-1')
		expect(state.activeTabId).toBe('doc-tab-1')
	})

	test('closeDocumentTab 关闭当前 tab 时应切到邻近 tab', () => {
		const store = useWorkbenchStore.getState()

		store.syncDocumentTab({
			id: 'doc-tab-1',
			title: '文档一',
		})
		useWorkbenchStore.getState().syncDocumentTab({
			id: 'doc-tab-2',
			title: '文档二',
		})

		const nextDocumentId = useWorkbenchStore.getState().closeDocumentTab('doc-tab-2')
		const state = useWorkbenchStore.getState()

		expect(nextDocumentId).toBe('doc-tab-1')
		expect(state.tabs).toEqual([{ id: 'doc-tab-1', title: '文档一' }])
		expect(state.activeDocumentId).toBe('doc-tab-1')
		expect(state.activeTabId).toBe('doc-tab-1')
	})

	test('activateDocumentTab 激活已打开文档时应同步 activeTabId', () => {
		const store = useWorkbenchStore.getState()

		store.syncDocumentTab({
			id: 'doc-tab-1',
			title: '文档一',
		})
		useWorkbenchStore.getState().syncDocumentTab({
			id: 'doc-tab-2',
			title: '文档二',
		})

		useWorkbenchStore.getState().activateDocumentTab('doc-tab-1')
		const state = useWorkbenchStore.getState()

		expect(state.activeDocumentId).toBe('doc-tab-1')
		expect(state.activeTabId).toBe('doc-tab-1')
	})
})
