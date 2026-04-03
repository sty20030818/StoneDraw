import { beforeEach, describe, expect, test, vi } from 'vitest'
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
	const markSceneAsSaveStartedMock = vi.fn<(...args: never[]) => void>()
	const markSceneAsSaveFailedMock = vi.fn<(...args: never[]) => void>()
	const markSceneAsSavedMock = vi.fn<(...args: never[]) => void>()

	vi.resetModules()
	vi.doMock('@/services/editor.service', () => ({
		editorService: {
			saveScene: saveSceneMock,
		},
	}))
	vi.doMock('./runtime', () => ({
		readActiveScene: readActiveSceneMock,
		markSceneAsSaveStarted: markSceneAsSaveStartedMock,
		markSceneAsSaveFailed: markSceneAsSaveFailedMock,
		markSceneAsSaved: markSceneAsSavedMock,
	}))

	const module = await import('./save')

	return {
		...module,
		saveSceneMock,
		readActiveSceneMock,
		markSceneAsSaveStartedMock,
		markSceneAsSaveFailedMock,
		markSceneAsSavedMock,
	}
}

describe('saveActiveDocumentScene', () => {
	beforeEach(() => {
		vi.resetModules()
		vi.clearAllMocks()
	})

	test('编辑器未准备好时应直接返回失败', async () => {
		const { saveActiveDocumentScene, readActiveSceneMock, saveSceneMock, markSceneAsSaveStartedMock } =
			await importSaveModule()
		readActiveSceneMock.mockReturnValueOnce(null)

		const result = await saveActiveDocumentScene(document)

		expect(result.ok).toBe(false)
		expect(saveSceneMock).not.toHaveBeenCalled()
		expect(markSceneAsSaveStartedMock).not.toHaveBeenCalled()
		if (result.ok) {
			throw new Error('编辑器未准备好时不应返回成功结果')
		}
		expect(result.error.code).toBe('INVALID_ARGUMENT')
	})

	test('保存成功时应标记保存开始和已保存', async () => {
		const {
			saveActiveDocumentScene,
			readActiveSceneMock,
			saveSceneMock,
			markSceneAsSaveStartedMock,
			markSceneAsSavedMock,
		} = await importSaveModule()
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

		const result = await saveActiveDocumentScene(document)

		expect(readActiveSceneMock).toHaveBeenCalledWith(document.id, document.title)
		expect(markSceneAsSaveStartedMock).toHaveBeenCalledWith(scene)
		expect(saveSceneMock).toHaveBeenCalledWith(scene)
		expect(markSceneAsSavedMock).toHaveBeenCalledWith(
			expect.objectContaining({
				documentId: document.id,
				updatedAt: savedDocument.updatedAt,
			}),
		)
		expect(result.ok).toBe(true)
		if (!result.ok) {
			throw new Error('保存成功时应返回成功结果')
		}
		expect(result.data.document.updatedAt).toBe(2)
		expect(result.data.scene.updatedAt).toBe(2)
	})

	test('保存失败时应标记失败并透传错误', async () => {
		const {
			saveActiveDocumentScene,
			readActiveSceneMock,
			saveSceneMock,
			markSceneAsSaveStartedMock,
			markSceneAsSaveFailedMock,
			markSceneAsSavedMock,
		} = await importSaveModule()
		const scene = createScenePayload({
			documentId: document.id,
			title: document.title,
		})

		readActiveSceneMock.mockReturnValueOnce(scene)
		saveSceneMock.mockResolvedValueOnce({
			ok: false,
			error: {
				code: 'IO_ERROR',
				message: '写入失败',
				details: 'disk-full',
			},
		})

		const result = await saveActiveDocumentScene(document)

		expect(markSceneAsSaveStartedMock).toHaveBeenCalledWith(scene)
		expect(markSceneAsSaveFailedMock).toHaveBeenCalledWith('disk-full')
		expect(markSceneAsSavedMock).not.toHaveBeenCalled()
		expect(result.ok).toBe(false)
		if (result.ok) {
			throw new Error('保存失败时不应返回成功结果')
		}
		expect(result.error.message).toBe('写入失败')
	})
})
