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

	test('保存中再次编辑时应保留 saving 并标记补偿保存', () => {
		clearEditorApi()
		useEditorStore.getState().reset()

		setEditorApi(
			createFakeApi({
				elements: [{ id: 'element-after-save' }],
			}),
		)
		setSceneObservationBaseline(
			serializeScene(
				'doc-runtime-2',
				{
					elements: [],
					appState: {} as never,
					files: {},
				},
				{ title: '空白文档' },
			),
		)
		useEditorStore.getState().setSaveStatus('saving')

		const observedScene = observeSceneChange(
			'doc-runtime-2',
			[{ id: 'transient-text' }] as never,
			{} as never,
			{} as never,
			'空白文档',
		)
		const runtimeState = useEditorStore.getState() as Record<string, unknown>

		expect(observedScene.scene.elements).toEqual([{ id: 'element-after-save' }])
		expect(useEditorStore.getState().saveStatus).toBe('saving')
		expect(runtimeState.hasPendingCompensationSave).toBe(true)
	})
})
