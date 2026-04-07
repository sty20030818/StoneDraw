import { beforeEach, describe, expect, test } from 'vitest'
import { useDocumentStore } from './document.store'

describe('document.store compatibility', () => {
	beforeEach(() => {
		useDocumentStore.getState().reset()
	})

	test('旧 stores 入口应继续导出文档 store', () => {
		const documentStore = useDocumentStore.getState()

		documentStore.setSelectedDocumentId('doc-compatibility-1')

		expect(useDocumentStore.getState().selectedDocumentId).toBe('doc-compatibility-1')
	})
})
