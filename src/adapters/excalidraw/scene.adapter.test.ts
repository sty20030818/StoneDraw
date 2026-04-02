import { describe, expect, test } from 'vitest'
import {
	SceneValidationError,
	createInitialSceneData,
	createSceneFingerprint,
	deserializeScene,
	serializeScene,
} from './scene.adapter'
import { createScenePayload } from '@/test/fixtures/scene'

const EXCALIDRAW_DEFAULT_PERSISTED_APP_STATE = {
	gridModeEnabled: false,
	viewBackgroundColor: '#ffffff',
	gridSize: 20,
	gridStep: 5,
}

describe('scene.adapter', () => {
	test('只保留可持久化的 appState 白名单字段', () => {
		const payload = serializeScene(
			'doc-1',
			{
				elements: [{ id: 'element-1' }] as never,
				appState: {
					viewBackgroundColor: '#fff',
					gridModeEnabled: true,
					scrollX: 120,
					scrollY: 48,
					selectedElementIds: { 'element-1': true },
				} as never,
				files: { fileA: { id: 'fileA' } } as never,
			},
			{ title: '测试文档' },
		)

		expect(payload.scene.appState).toEqual({
			gridModeEnabled: true,
			viewBackgroundColor: '#fff',
		})
		expect(payload.scene.files).toEqual({ fileA: { id: 'fileA' } })
		expect(payload.meta.title).toBe('测试文档')
		expect(payload.meta.tags).toEqual([])
		expect(payload.meta.textIndex).toEqual('')
	})

	test('反序列化时补齐可安全缺省字段', () => {
		const payload = deserializeScene({
			documentId: 'doc-2',
			scene: {
				elements: [],
			},
			meta: {
				title: '旧文档',
			},
		})

		expect(payload.schemaVersion).toBe(1)
		expect(payload.scene.appState).toEqual({})
		expect(payload.scene.files).toEqual({})
		expect(payload.meta).toEqual({
			title: '旧文档',
			tags: [],
			textIndex: '',
		})
		expect(typeof payload.updatedAt).toBe('number')
	})

	test('关键结构损坏时抛出校验错误', () => {
		let error: unknown = null

		try {
			deserializeScene({
				documentId: 'doc-3',
				scene: {
					elements: 'invalid',
				},
				meta: {
					title: '坏文档',
				},
			})
		} catch (caughtError) {
			error = caughtError
		}

		expect(error instanceof SceneValidationError).toBe(true)
	})

	test('documentId 不匹配时抛出校验错误', () => {
		let error: unknown = null

		try {
			deserializeScene(
				{
					documentId: 'doc-actual',
					scene: {
						elements: [],
					},
					meta: {
						title: '坏文档',
					},
				},
				{ expectedDocumentId: 'doc-expected' },
			)
		} catch (caughtError) {
			error = caughtError
		}

		expect(error instanceof SceneValidationError).toBe(true)
	})

	test('相同可持久化内容应得到相同指纹', () => {
		const first = serializeScene(
			'doc-4',
			{
				elements: [{ id: 'element-4' }] as never,
				appState: {
					viewBackgroundColor: '#fff',
					scrollX: 100,
				} as never,
				files: {},
			},
			{ title: '指纹文档' },
		)
		const second = serializeScene(
			'doc-4',
			{
				elements: [{ id: 'element-4' }] as never,
				appState: {
					viewBackgroundColor: '#fff',
					scrollX: 200,
				} as never,
				files: {},
			},
			{ title: '指纹文档' },
		)

		expect(createSceneFingerprint(first)).toBe(createSceneFingerprint(second))
	})

	test('Excalidraw 默认 appState 不应触发初始化脏状态', () => {
		const initialScene = createScenePayload({
			documentId: 'doc-6',
			title: '空白文档',
		})
		const mountedScene = createScenePayload({
			documentId: 'doc-6',
			title: '空白文档',
			appState: EXCALIDRAW_DEFAULT_PERSISTED_APP_STATE,
		})

		expect(initialScene.scene.appState).toEqual({})
		expect(mountedScene.scene.appState).toEqual({})
		expect(createSceneFingerprint(initialScene)).toBe(createSceneFingerprint(mountedScene))
	})

	test('从 envelope 恢复 Excalidraw initialData', () => {
		const payload = serializeScene(
			'doc-5',
			{
				elements: [{ id: 'element-5' }] as never,
				appState: {
					viewBackgroundColor: '#fff',
					gridSize: 16,
				} as never,
				files: { fileB: { id: 'fileB' } } as never,
			},
			{ title: '另一个文档' },
		)

		const initialData = createInitialSceneData(payload)

		expect(initialData.elements).toEqual([{ id: 'element-5' }])
		expect(initialData.appState).toEqual({
			viewBackgroundColor: '#fff',
			gridSize: 16,
		})
		expect(initialData.files).toEqual({ fileB: { id: 'fileB' } })
	})
})
