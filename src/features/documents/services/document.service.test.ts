import { beforeEach, describe, expect, test, vi } from 'vitest'
import { createAppError } from '@/test/fixtures/error'
import { createDocumentMeta } from '@/test/fixtures/document'
import { createScenePayload } from '@/test/fixtures/scene'

const createMock = vi.fn<(...args: never[]) => Promise<unknown>>()
const getByIdMock = vi.fn<(...args: never[]) => Promise<unknown>>()
const listMock = vi.fn<(...args: never[]) => Promise<unknown>>()
const listRecentMock = vi.fn<(...args: never[]) => Promise<unknown>>()
const listTrashedMock = vi.fn<(...args: never[]) => Promise<unknown>>()
const openMock = vi.fn<(...args: never[]) => Promise<unknown>>()
const renameMock = vi.fn<(...args: never[]) => Promise<unknown>>()
const moveToTrashMock = vi.fn<(...args: never[]) => Promise<unknown>>()
const restoreMock = vi.fn<(...args: never[]) => Promise<unknown>>()
const permanentlyDeleteMock = vi.fn<(...args: never[]) => Promise<unknown>>()
const readCurrentMock = vi.fn<(...args: never[]) => Promise<unknown>>()

vi.mock('@/features/documents/api', () => ({
	documentRepository: {
		create: createMock,
		getById: getByIdMock,
		list: listMock,
		listRecent: listRecentMock,
		listTrashed: listTrashedMock,
		open: openMock,
		rename: renameMock,
		moveToTrash: moveToTrashMock,
		restore: restoreMock,
		permanentlyDelete: permanentlyDeleteMock,
	},
	sceneRepository: {
		readCurrent: readCurrentMock,
	},
}))

describe('document.service', () => {
	beforeEach(() => {
		createMock.mockReset()
		getByIdMock.mockReset()
		listMock.mockReset()
		listRecentMock.mockReset()
		listTrashedMock.mockReset()
		openMock.mockReset()
		renameMock.mockReset()
		moveToTrashMock.mockReset()
		restoreMock.mockReset()
		permanentlyDeleteMock.mockReset()
		readCurrentMock.mockReset()

		const document = createDocumentMeta()

		createMock.mockResolvedValue({
			ok: true,
			data: document,
		})
		getByIdMock.mockResolvedValue({
			ok: true,
			data: document,
		})
		listMock.mockResolvedValue({
			ok: true,
			data: [document],
		})
		listRecentMock.mockResolvedValue({
			ok: true,
			data: [document],
		})
		listTrashedMock.mockResolvedValue({
			ok: true,
			data: [],
		})
		openMock.mockResolvedValue({
			ok: true,
			data: document,
		})
		renameMock.mockResolvedValue({
			ok: true,
			data: {
				...document,
				title: '重命名后',
			},
		})
		moveToTrashMock.mockResolvedValue({
			ok: true,
			data: {
				...document,
				isDeleted: true,
			},
		})
		restoreMock.mockResolvedValue({
			ok: true,
			data: document,
		})
		permanentlyDeleteMock.mockResolvedValue({
			ok: true,
			data: undefined,
		})
		readCurrentMock.mockResolvedValue({
			ok: true,
			data: createScenePayload({
				documentId: document.id,
				title: document.title,
			}),
		})
	})

	test('loadWorkspaceCollections 应统一装载三组集合', async () => {
		const { documentService } = await import('./document.service')

		const result = await documentService.loadWorkspaceCollections()

		expect(result.ok).toBe(true)
		if (!result.ok) {
			throw new Error('集合装载应成功')
		}
		expect(result.data.documents).toHaveLength(1)
		expect(result.data.recentDocuments).toHaveLength(1)
		expect(result.data.trashedDocuments).toHaveLength(0)
		expect(listMock).toHaveBeenCalledTimes(1)
		expect(listRecentMock).toHaveBeenCalledTimes(1)
		expect(listTrashedMock).toHaveBeenCalledTimes(1)
	})

	test('createBlankDocument 应返回文档与最新集合', async () => {
		const { documentService } = await import('./document.service')

		const result = await documentService.createBlankDocument('新文档')

		expect(createMock).toHaveBeenCalledWith('新文档')
		expect(result.ok).toBe(true)
		if (!result.ok) {
			throw new Error('createBlankDocument 应成功')
		}
		expect(result.data.document.id).toBe('doc-test-1')
		expect(result.data.collections.documents).toHaveLength(1)
	})

	test('openDocument 应执行正式打开动作并返回 scene 与集合', async () => {
		const { documentService } = await import('./document.service')

		const result = await documentService.openDocument('doc-test-1')

		expect(openMock).toHaveBeenCalledWith('doc-test-1')
		expect(readCurrentMock).toHaveBeenCalledWith('doc-test-1')
		expect(result.ok).toBe(true)
		if (!result.ok) {
			throw new Error('openDocument 应成功')
		}
		expect(result.data.document.id).toBe('doc-test-1')
		expect(result.data.scene.documentId).toBe('doc-test-1')
		expect(result.data.collections.recentDocuments).toHaveLength(1)
	})

	test('openDocument 在 scene 读取失败时应返回失败', async () => {
		const { documentService } = await import('./document.service')
		const failureResult = {
			ok: false,
			error: createAppError({
				code: 'IO_ERROR',
				message: 'scene 读取失败',
				module: 'scene-repository',
				operation: 'readCurrent',
			}),
		}

		readCurrentMock.mockResolvedValueOnce(failureResult)

		expect(await documentService.openDocument('doc-open')).toEqual(failureResult)
	})

	test('renameDocument、trashDocument、restoreDocument 应返回带集合的结果', async () => {
		const { documentService } = await import('./document.service')

		const renameResult = await documentService.renameDocument('doc-rename', '标题')
		const trashResult = await documentService.trashDocument('doc-trash')
		const restoreResult = await documentService.restoreDocument('doc-restore')

		expect(renameMock).toHaveBeenCalledWith('doc-rename', '标题')
		expect(moveToTrashMock).toHaveBeenCalledWith('doc-trash')
		expect(restoreMock).toHaveBeenCalledWith('doc-restore')
		expect(renameResult.ok).toBe(true)
		expect(trashResult.ok).toBe(true)
		expect(restoreResult.ok).toBe(true)
	})

	test('permanentlyDeleteDocument 成功后应重新装载集合', async () => {
		const { documentService } = await import('./document.service')

		const result = await documentService.permanentlyDeleteDocument('doc-delete')

		expect(permanentlyDeleteMock).toHaveBeenCalledWith('doc-delete')
		expect(result.ok).toBe(true)
		if (!result.ok) {
			throw new Error('permanentlyDeleteDocument 应成功')
		}
		expect(result.data.documents).toHaveLength(1)
	})
})
