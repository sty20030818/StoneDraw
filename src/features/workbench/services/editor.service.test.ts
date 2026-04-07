import { beforeEach, describe, expect, test, vi } from 'vitest'
import { TAURI_COMMANDS } from '@/shared/constants'
import type { SceneFilePayload } from '@/shared/types'
import { createScenePayload } from '@/test/fixtures/scene'

const readCurrentMock = vi.fn<(...args: never[]) => Promise<unknown>>()
const saveCurrentMock = vi.fn<(...args: never[]) => Promise<unknown>>()

vi.mock('@/features/documents', () => ({
	sceneRepository: {
		readCurrent: readCurrentMock,
		saveCurrent: saveCurrentMock,
	},
}))

vi.mock('@/platform/tauri', () => ({
	createSuccessResult: <TData>(data: TData) => ({ ok: true as const, data }),
	createFailureResult: (error: unknown) => ({ ok: false as const, error }),
}))

describe('editor.service', () => {
	beforeEach(() => {
		readCurrentMock.mockReset()
		saveCurrentMock.mockReset()
	})

	test('loadScene 成功时应返回校验后的 scene', async () => {
		const { editorService } = await import('./editor.service')
		const scene = createScenePayload({
			documentId: 'doc-service-1',
			title: '服务文档',
		})

		readCurrentMock.mockResolvedValueOnce({
			ok: true,
			data: scene,
		})

		const result = await editorService.loadScene('doc-service-1')

		expect(result.ok).toBe(true)
		if (!result.ok) {
			throw new Error('loadScene 应返回成功结果')
		}
		expect(result.data.documentId).toBe('doc-service-1')
		expect(result.data.meta.title).toBe('服务文档')
		expect(readCurrentMock).toHaveBeenCalledWith('doc-service-1')
	})

	test('loadScene 读取到非法 scene 时应返回结构化失败', async () => {
		const { editorService } = await import('./editor.service')

		readCurrentMock.mockResolvedValueOnce({
			ok: true,
			data: {
				documentId: 'doc-service-2',
				scene: {
					elements: 'broken',
				},
				meta: {
					title: '坏文档',
				},
			},
		})

		const result = await editorService.loadScene('doc-service-2')

		expect(result.ok).toBe(false)
		if (result.ok) {
			throw new Error('非法 scene 不应返回成功结果')
		}
		expect(result.error.code).toBe('INVALID_ARGUMENT')
		expect(result.error.command).toBe(TAURI_COMMANDS.DOCUMENTS_OPEN_SCENE)
	})

	test('saveScene 应先规范化 payload 再调用保存命令', async () => {
		const { editorService } = await import('./editor.service')
		const payload = createScenePayload({
			documentId: 'doc-service-3',
			title: '保存文档',
			appState: {
				viewBackgroundColor: '#fff',
				scrollX: 200,
			},
		})

		saveCurrentMock.mockResolvedValueOnce({
			ok: true,
			data: {
				id: 'doc-service-3',
				title: '保存文档',
				createdAt: 1,
				updatedAt: 2,
				lastOpenedAt: 2,
				isDeleted: false,
				deletedAt: null,
				sourceType: 'local',
				saveStatus: 'saved',
			},
		})

		const result = await editorService.saveScene(payload)

		expect(result.ok).toBe(true)
		if (!result.ok) {
			throw new Error('saveScene 应返回成功结果')
		}
		expect(saveCurrentMock).toHaveBeenCalledWith(
			expect.objectContaining({
				documentId: 'doc-service-3',
				meta: expect.objectContaining({
					title: '保存文档',
				}),
			}),
		)
	})

	test('saveScene 在 payload 非法时应直接失败而不调用命令', async () => {
		const { editorService } = await import('./editor.service')

		const result = await editorService.saveScene({
			documentId: 'doc-service-4',
			schemaVersion: 1,
			updatedAt: 1,
			scene: {
				elements: 'broken',
				appState: {},
				files: {},
			},
			meta: {
				title: '坏 scene',
				tags: [],
				textIndex: '',
			},
		} as unknown as SceneFilePayload)

		expect(result.ok).toBe(false)
		expect(saveCurrentMock).not.toHaveBeenCalled()
		if (result.ok) {
			throw new Error('非法 payload 不应返回成功结果')
		}
		expect(result.error.code).toBe('INVALID_ARGUMENT')
		expect(result.error.command).toBe(TAURI_COMMANDS.EDITOR_SAVE_SCENE)
	})
})
