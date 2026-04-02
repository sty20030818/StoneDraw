import { describe, expect, test } from 'bun:test'
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types'
import { serializeScene } from '@/adapters/excalidraw'
import { useEditorStore } from '@/stores'
import { clearEditorApi, observeSceneChange, setEditorApi, setSceneObservationBaseline } from './runtime'

function createFakeApi(snapshot: {
	elements: unknown[]
	appState?: Record<string, unknown>
	files?: Record<string, unknown>
}): ExcalidrawImperativeAPI {
	return {
		id: 'fake-api',
		getSceneElements: () => snapshot.elements as never,
		getAppState: () => (snapshot.appState ?? {}) as never,
		getFiles: () => (snapshot.files ?? {}) as never,
	} as unknown as ExcalidrawImperativeAPI
}

describe('editor.runtime', () => {
	test('应基于 API 权威快照而不是 onChange 临时元素判定 dirty', () => {
		clearEditorApi()
		useEditorStore.getState().reset()

		setEditorApi(
			createFakeApi({
				elements: [],
			}),
		)
		setSceneObservationBaseline(
			serializeScene(
				'doc-runtime-1',
				{
					elements: [],
					appState: {} as never,
					files: {},
				},
				{ title: '空白文档' },
			),
		)

		const observedScene = observeSceneChange(
			'doc-runtime-1',
			[{ id: 'transient-text' }] as never,
			{} as never,
			{} as never,
			'空白文档',
		)

		expect(observedScene.scene.elements).toEqual([])
		expect(useEditorStore.getState().saveStatus).toBe('saved')
		expect(useEditorStore.getState().lastSceneElementCount).toBe(0)
	})
})
