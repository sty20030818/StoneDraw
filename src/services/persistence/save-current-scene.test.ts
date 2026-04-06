import { beforeEach, describe, expect, test, vi } from 'vitest'
import { createAppError } from '@/test/fixtures/error'
import type { DocumentMeta } from '@/types'
import { createDocumentMeta } from '@/test/fixtures/document'
import { createScenePayload } from '@/test/fixtures/scene'

const document: Pick<DocumentMeta, 'id' | 'title'> = createDocumentMeta({
	id: 'doc-save-1',
	title: '保存测试文档',
})

async function importSaveModule() {
	const saveSceneMock = vi.fn<(...args: never[]) => Promise<unknown>>()
	const readActiveSceneMock = vi.fn<(...args: never[]) => unknown>()

	vi.resetModules()
	vi.doMock('@/services/workbench/editor.service', () => ({
		editorService: {
			saveScene: saveSceneMock,
		},
	}))
	vi.doMock('@/workbench/editor-runtime', () => ({
		readActiveScene: readActiveSceneMock,
	}))

	const module = await import('./save-current-scene')

	return {
		...module,
		saveSceneMock,
		readActiveSceneMock,
	}
}

describe('saveCurrentDocumentScene', () => {
	beforeEach(() => {
		vi.resetModules()
		vi.clearAllMocks()
	})

	test('编辑器未准备好时应直接返回失败', async () => {
		const { saveCurrentDocumentScene, readActiveSceneMock, saveSceneMock } = await importSaveModule()
		readActiveSceneMock.mockReturnValueOnce(null)

		const result = await saveCurrentDocumentScene(document)

		expect(result.ok).toBe(false)
		expect(saveSceneMock).not.toHaveBeenCalled()
		if (result.ok) {
			throw new Error('编辑器未准备好时不应返回成功结果')
		}
		expect(result.error.code).toBe('INVALID_ARGUMENT')
	})

	test('保存成功时应返回最新文档与 scene', async () => {
		const { saveCurrentDocumentScene, readActiveSceneMock, saveSceneMock } = await importSaveModule()
		const scene = createScenePayload({
			documentId: document.id,
			title: document.title,
			elements: [{ id: 'element-1' }],
		})
		const savedDocument = createDocumentMeta({
			id: document.id,
			title: document.title,
			updatedAt: 2,
		})

		readActiveSceneMock.mockReturnValueOnce(scene)
		saveSceneMock.mockResolvedValueOnce({
			ok: true,
			data: savedDocument,
		})

		const result = await saveCurrentDocumentScene(document)

		expect(readActiveSceneMock).toHaveBeenCalledWith(document.id, document.title)
		expect(saveSceneMock).toHaveBeenCalledWith(scene)
		expect(result.ok).toBe(true)
		if (!result.ok) {
			throw new Error('保存成功时应返回成功结果')
		}
		expect(result.data.document.updatedAt).toBe(2)
		expect(result.data.scene.updatedAt).toBe(2)
	})

	test('保存失败时应透传错误', async () => {
		const { saveCurrentDocumentScene, readActiveSceneMock, saveSceneMock } = await importSaveModule()
		const scene = createScenePayload({
			documentId: document.id,
			title: document.title,
		})

		readActiveSceneMock.mockReturnValueOnce(scene)
		saveSceneMock.mockResolvedValueOnce({
			ok: false,
			error: createAppError({
				code: 'IO_ERROR',
				message: '写入失败',
				details: 'disk-full',
				module: 'document-repository',
				operation: 'saveScene',
				objectId: document.id,
			}),
		})

		const result = await saveCurrentDocumentScene(document)

		expect(saveSceneMock).toHaveBeenCalledWith(scene)
		expect(result.ok).toBe(false)
		if (result.ok) {
			throw new Error('保存失败时不应返回成功结果')
		}
		expect(result.error.message).toBe('写入失败')
	})
})
