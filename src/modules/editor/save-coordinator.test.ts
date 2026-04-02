import { describe, expect, test } from 'bun:test'
import { createSuccessResult } from '@/services/tauri.service'
import type { DocumentMeta, SaveStatus } from '@/types'

type RuntimeSnapshot = {
	saveStatus: SaveStatus | 'error'
	hasPendingCompensationSave: boolean
	hasScheduledSave: boolean
	isFlushing: boolean
}

function createDocumentMeta(id: string, title: string): DocumentMeta {
	return {
		id,
		title,
		currentScenePath: '/tmp/current.scene.json',
		createdAt: 1,
		updatedAt: 1,
		lastOpenedAt: 1,
		isDeleted: false,
		deletedAt: null,
		sourceType: 'local',
		saveStatus: 'saved',
	}
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
					document: createDocumentMeta('doc-1', '文档'),
					scene: {
						documentId: 'doc-1',
						schemaVersion: 1,
						updatedAt: 1,
						scene: { elements: [], appState: {}, files: {} },
						meta: { title: '文档', tags: [], textIndex: '' },
					},
				})
			},
		})

		coordinator.scheduleAutoSave({
			id: 'doc-1',
			title: '文档',
		})
		await new Promise((resolve) => setTimeout(resolve, 30))

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
					document: createDocumentMeta('doc-2', '显式保存文档'),
					scene: {
						documentId: 'doc-2',
						schemaVersion: 1,
						updatedAt: 2,
						scene: { elements: [], appState: {}, files: {} },
						meta: { title: '显式保存文档', tags: [], textIndex: '' },
					},
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
