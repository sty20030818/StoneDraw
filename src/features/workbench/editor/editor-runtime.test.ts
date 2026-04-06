import { beforeEach, describe, expect, test, vi } from 'vitest'
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types'
import { createScenePayload } from '@/test/fixtures/scene'
import { applyScene, clearEditorApi, readActiveScene, setEditorApi } from './editor-runtime'

function createFakeApi(snapshot: {
	elements: unknown[]
	appState?: Record<string, unknown>
	files?: Record<string, unknown>
}) {
	const updateScene = vi.fn<(...args: unknown[]) => void>()

	return {
		api: {
			id: 'fake-api',
			getSceneElements: () => snapshot.elements as never,
			getAppState: () => (snapshot.appState ?? {}) as never,
			getFiles: () => (snapshot.files ?? {}) as never,
			updateScene,
		} as unknown as ExcalidrawImperativeAPI,
		updateScene,
	}
}

describe('editor-runtime', () => {
	beforeEach(() => {
		clearEditorApi()
	})

	test('readActiveScene 应返回 API 的权威快照', () => {
		const { api } = createFakeApi({
			elements: [{ id: 'element-1' }],
			appState: {
				gridModeEnabled: true,
			},
		})

		setEditorApi(api)

		const observedScene = readActiveScene('doc-runtime-1', '空白文档')

		expect(observedScene).not.toBeNull()
		expect(observedScene?.scene.elements).toEqual([{ id: 'element-1' }])
		expect(observedScene?.meta.title).toBe('空白文档')
	})

	test('未设置 API 时 readActiveScene 应返回 null', () => {
		expect(readActiveScene('doc-runtime-2', '空白文档')).toBeNull()
	})

	test('applyScene 在 API 存在时应写回画布并返回 true', () => {
		const { api, updateScene } = createFakeApi({
			elements: [],
		})

		setEditorApi(api)

		expect(
			applyScene(
				createScenePayload({
					documentId: 'doc-runtime-3',
					title: '一致文档',
				}),
			),
		).toBe(true)
		expect(updateScene).toHaveBeenCalledTimes(1)
	})
})
