import { describe, expect, test } from 'bun:test'
import { createInitialSceneData, createScenePayload } from './scene.adapter'

describe('scene.adapter', () => {
	test('创建正式 scene envelope', () => {
		const payload = createScenePayload(
			'doc-1',
			[{ id: 'element-1' }] as never,
			{ theme: 'light' } as never,
			{ fileA: { id: 'fileA' } } as never,
			'测试文档',
		)

		expect(payload.documentId).toBe('doc-1')
		expect(payload.schemaVersion).toBe(1)
		expect(payload.scene.elements).toEqual([{ id: 'element-1' }])
		expect(payload.scene.appState).toEqual({ theme: 'light' })
		expect(payload.scene.files).toEqual({ fileA: { id: 'fileA' } })
		expect(payload.meta.title).toBe('测试文档')
		expect(payload.meta.tags).toEqual([])
		expect(payload.meta.textIndex).toBe('')
		expect(typeof payload.updatedAt).toBe('number')
	})

	test('从 envelope 恢复 Excalidraw initialData', () => {
		const payload = createScenePayload(
			'doc-2',
			[{ id: 'element-2' }] as never,
			{ viewBackgroundColor: '#fff' } as never,
			{ fileB: { id: 'fileB' } } as never,
			'另一个文档',
		)

		const initialData = createInitialSceneData(payload)

		expect(initialData.elements).toEqual([{ id: 'element-2' }])
		expect(initialData.appState).toEqual({ viewBackgroundColor: '#fff' })
		expect(initialData.files).toEqual({ fileB: { id: 'fileB' } })
	})
})
