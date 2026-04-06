import { describe, expect, test } from 'vitest'
import { createScenePayload } from '@/test/fixtures/scene'
import { normalizeWorkbenchScene } from './scene-restore-bridge'

describe('workbench.scene-restore-bridge', () => {
	test('documentId 匹配时应保留原始场景', () => {
		const scene = createScenePayload({
			documentId: 'doc-restore-1',
			title: '恢复桥文档',
			elements: [{ id: 'element-1' }],
		})

		const result = normalizeWorkbenchScene(scene, {
			documentId: 'doc-restore-1',
			title: '恢复桥文档',
		})

		expect(result.recoveredFromFallback).toBe(false)
		expect(result.scene.documentId).toBe('doc-restore-1')
		expect(result.scene.scene.elements).toEqual([{ id: 'element-1' }])
	})

	test('documentId 不匹配时应回退为空白场景', () => {
		const scene = createScenePayload({
			documentId: 'doc-restore-origin',
			title: '原始文档',
			elements: [{ id: 'element-2' }],
		})

		const result = normalizeWorkbenchScene(scene, {
			documentId: 'doc-restore-target',
			title: '目标文档',
		})

		expect(result.recoveredFromFallback).toBe(true)
		expect(result.scene.documentId).toBe('doc-restore-target')
		expect(result.scene.meta.title).toBe('目标文档')
		expect(result.scene.scene.elements).toEqual([])
	})
})
