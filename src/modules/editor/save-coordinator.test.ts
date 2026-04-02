import { describe, expect, test, vi } from 'vitest'
import { createSuccessResult } from '@/services/tauri.service'
import type { SaveStatus } from '@/types'
import { createDocumentMeta } from '@/test/fixtures/document'
import { createScenePayload } from '@/test/fixtures/scene'

type RuntimeSnapshot = {
	saveStatus: SaveStatus | 'error'
	hasPendingCompensationSave: boolean
	hasScheduledSave: boolean
	isFlushing: boolean
}

function createRuntimeState(initialState?: Partial<RuntimeSnapshot>) {
	const state: RuntimeSnapshot = {
		saveStatus: 'saved',
		hasPendingCompensationSave: false,
		hasScheduledSave: false,
		isFlushing: false,
		...initialState,
	}

	return {
		read: () => state,
		write: (patch: Partial<RuntimeSnapshot>) => {
			Object.assign(state, patch)
		},
	}
}

describe('editor.save-coordinator', () => {
	test('scheduleAutoSave 应在防抖窗口后触发一次保存', async () => {
		vi.useFakeTimers()
		const runtime = createRuntimeState({
			saveStatus: 'dirty',
		})
		let saveCount = 0
		const { createSaveCoordinator } = await import('./save-coordinator')
		const coordinator = createSaveCoordinator({
			debounceMs: 10,
			readRuntimeState: runtime.read,
			writeRuntimeState: runtime.write,
			executeSave: async () => {
				saveCount += 1
				runtime.write({
					saveStatus: 'saved',
				})

				return createSuccessResult({
					document: createDocumentMeta({ id: 'doc-1', title: '文档' }),
					scene: createScenePayload({ documentId: 'doc-1', title: '文档' }),
				})
			},
		})

		coordinator.scheduleAutoSave({
			id: 'doc-1',
			title: '文档',
		})
		await vi.advanceTimersByTimeAsync(30)

		expect(saveCount).toBe(1)
		expect(runtime.read().hasScheduledSave).toBe(false)
	})

	test('saveNow 应在当前已保存时仍执行一次显式保存', async () => {
		const runtime = createRuntimeState({
			saveStatus: 'saved',
		})
		let saveCount = 0
		const { createSaveCoordinator } = await import('./save-coordinator')
		const coordinator = createSaveCoordinator({
			readRuntimeState: runtime.read,
			writeRuntimeState: runtime.write,
			executeSave: async () => {
				saveCount += 1
				runtime.write({
					saveStatus: 'saved',
				})

				return createSuccessResult({
					document: createDocumentMeta({
						id: 'doc-2',
						title: '显式保存文档',
						updatedAt: 2,
					}),
					scene: createScenePayload({ documentId: 'doc-2', title: '显式保存文档' }),
				})
			},
		})

		const result = await coordinator.saveNow({
			id: 'doc-2',
			title: '显式保存文档',
		})

		expect(result.ok).toBe(true)
		expect(saveCount).toBe(1)
	})

	test('保存中再次标记补偿保存后应追加一次串行保存', async () => {
		const runtime = createRuntimeState({
			saveStatus: 'dirty',
		})
		let saveCount = 0
		const { createSaveCoordinator } = await import('./save-coordinator')
		const coordinator = createSaveCoordinator({
			readRuntimeState: runtime.read,
			writeRuntimeState: runtime.write,
			executeSave: async () => {
				saveCount += 1

				if (saveCount === 1) {
					runtime.write({
						saveStatus: 'dirty',
						hasPendingCompensationSave: true,
					})
				} else {
					runtime.write({
						saveStatus: 'saved',
						hasPendingCompensationSave: false,
					})
				}

				return createSuccessResult({
					document: createDocumentMeta({ id: 'doc-4', title: '补偿保存文档' }),
					scene: createScenePayload({ documentId: 'doc-4', title: '补偿保存文档' }),
				})
			},
		})

		const result = await coordinator.saveNow({
			id: 'doc-4',
			title: '补偿保存文档',
		})

		expect(result.ok).toBe(true)
		expect(saveCount).toBe(2)
	})

	test('flushPendingSave 失败后应返回 false 并清理 flushing 状态', async () => {
		const runtime = createRuntimeState({
			saveStatus: 'dirty',
		})
		const { createSaveCoordinator } = await import('./save-coordinator')
		const coordinator = createSaveCoordinator({
			readRuntimeState: runtime.read,
			writeRuntimeState: runtime.write,
			executeSave: async () => {
				runtime.write({
					saveStatus: 'error',
				})

				return {
					ok: false,
					error: {
						code: 'UNKNOWN_ERROR',
						message: '保存失败',
					},
				}
			},
		})

		const result = await coordinator.flushPendingSave(
			{
				id: 'doc-3',
				title: 'flush 文档',
			},
			'route-leave',
		)

		expect(result).toBe(false)
		expect(runtime.read().isFlushing).toBe(false)
	})
})
