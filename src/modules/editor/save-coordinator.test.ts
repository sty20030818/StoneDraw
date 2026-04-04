import { describe, expect, test, vi } from 'vitest'
import { createDocumentMeta } from '@/test/fixtures/document'
import { createScenePayload } from '@/test/fixtures/scene'
import { createDeferredPromise } from '@/test/helpers/deferred'

function createUiStateTracker() {
	const state = {
		saveStatus: 'idle',
		lastSaveError: null as string | null,
		isFlushing: false,
	}

	return {
		state,
		write: (patch: Partial<typeof state>) => {
			Object.assign(state, patch)
		},
	}
}

describe('editor.save-coordinator', () => {
	test('onSceneChange 应基于 API 权威快照而不是临时回调数据判定状态', async () => {
		const uiState = createUiStateTracker()
		const document = createDocumentMeta({
			id: 'doc-1',
			title: '权威快照文档',
		})
		const baselineScene = createScenePayload({
			documentId: document.id,
			title: document.title,
		})
		const authoritativeScene = createScenePayload({
			documentId: document.id,
			title: document.title,
		})
		const { createEditorSaveSession } = await import('./save-coordinator')
		const session = createEditorSaveSession({
			readScene: () => authoritativeScene,
			executeSave: vi.fn<() => Promise<never>>(),
			writeUiState: uiState.write,
		})

		session.initialize(baselineScene)
		const observedScene = session.onSceneChange(document, [{ id: 'transient-text' }] as never, {} as never, {} as never)

		expect(observedScene.scene.elements).toEqual([])
		expect(uiState.state.saveStatus).toBe('saved')
	})

	test('saveNow 应在当前已保存时仍执行一次显式保存', async () => {
		const uiState = createUiStateTracker()
		const document = createDocumentMeta({
			id: 'doc-2',
			title: '显式保存文档',
		})
		let saveCount = 0
		const { createEditorSaveSession } = await import('./save-coordinator')
		const session = createEditorSaveSession({
			readScene: () => createScenePayload({ documentId: document.id, title: document.title }),
			executeSave: async () => {
				saveCount += 1
				return {
					ok: true,
					data: {
						document: createDocumentMeta({
							id: document.id,
							title: document.title,
							updatedAt: 2,
						}),
						scene: createScenePayload({
							documentId: document.id,
							title: document.title,
						}),
					},
				}
			},
			writeUiState: uiState.write,
		})

		session.initialize(createScenePayload({ documentId: document.id, title: document.title }))
		const result = await session.saveNow(document)

		expect(result.ok).toBe(true)
		expect(saveCount).toBe(1)
		expect(uiState.state.saveStatus).toBe('saved')
	})

	test('保存中再次编辑时应只追加一次补偿保存', async () => {
		const uiState = createUiStateTracker()
		const document = createDocumentMeta({
			id: 'doc-3',
			title: '补偿保存文档',
		})
		const initialScene = createScenePayload({
			documentId: document.id,
			title: document.title,
		})
		const firstDirtyScene = createScenePayload({
			documentId: document.id,
			title: document.title,
			elements: [{ id: 'element-1' }],
		})
		const secondDirtyScene = createScenePayload({
			documentId: document.id,
			title: document.title,
			elements: [{ id: 'element-2' }],
		})
		let latestScene = firstDirtyScene
		let saveCount = 0
		const firstSaveDeferred = createDeferredPromise<{
			ok: true
			data: {
				document: ReturnType<typeof createDocumentMeta>
				scene: typeof firstDirtyScene
			}
		}>()
		const { createEditorSaveSession } = await import('./save-coordinator')
		const session = createEditorSaveSession({
			readScene: () => latestScene,
			executeSave: () => {
				saveCount += 1

				if (saveCount === 1) {
					return firstSaveDeferred.promise
				}

				return Promise.resolve({
					ok: true as const,
					data: {
						document: createDocumentMeta({
							id: document.id,
							title: document.title,
							updatedAt: 3,
						}),
						scene: secondDirtyScene,
					},
				})
			},
			writeUiState: uiState.write,
		})

		session.initialize(initialScene)
		session.onSceneChange(document, [{ id: 'element-1' }] as never, {} as never, {} as never)
		const savePromise = session.saveNow(document)

		latestScene = secondDirtyScene
		session.onSceneChange(document, [{ id: 'element-2' }] as never, {} as never, {} as never)
		firstSaveDeferred.resolve({
			ok: true,
			data: {
				document: createDocumentMeta({
					id: document.id,
					title: document.title,
					updatedAt: 2,
				}),
				scene: firstDirtyScene,
			},
		})

		const result = await savePromise

		expect(result.ok).toBe(true)
		expect(saveCount).toBe(2)
		expect(uiState.state.saveStatus).toBe('saved')
	})

	test('flushBeforeLeave 失败后应返回 false 并清理 flushing 状态', async () => {
		const uiState = createUiStateTracker()
		const document = createDocumentMeta({
			id: 'doc-4',
			title: 'flush 文档',
		})
		const { createEditorSaveSession } = await import('./save-coordinator')
		const session = createEditorSaveSession({
			readScene: () => createScenePayload({ documentId: document.id, title: document.title }),
			executeSave: async () => ({
				ok: false,
				error: {
					code: 'UNKNOWN_ERROR',
					message: '保存失败',
				},
			}),
			writeUiState: uiState.write,
		})

		session.initialize(createScenePayload({ documentId: document.id, title: document.title }))
		session.onSceneChange(document, [{ id: 'element-1' }] as never, {} as never, {} as never)
		const result = await session.flushBeforeLeave(document)

		expect(result).toBe(false)
		expect(uiState.state.isFlushing).toBe(false)
		expect(uiState.state.saveStatus).toBe('error')
	})

	test('flushBeforeLeave 在窗口关闭超时时应返回 false 并清理 flushing 状态', async () => {
		vi.useFakeTimers()
		const uiState = createUiStateTracker()
		const document = createDocumentMeta({
			id: 'doc-5',
			title: '窗口关闭超时文档',
		})
		const { createEditorSaveSession } = await import('./save-coordinator')
		const session = createEditorSaveSession({
			readScene: () => createScenePayload({ documentId: document.id, title: document.title }),
			executeSave: async () => new Promise(() => undefined),
			writeUiState: uiState.write,
		})

		session.initialize(createScenePayload({ documentId: document.id, title: document.title }))
		session.onSceneChange(document, [{ id: 'element-1' }] as never, {} as never, {} as never)
		const flushPromise = session.flushBeforeLeave(document, {
			timeoutMs: 10,
		})

		await vi.advanceTimersByTimeAsync(20)

		expect(await flushPromise).toBe(false)
		expect(uiState.state.isFlushing).toBe(false)
	})
})
