import { beforeEach, describe, expect, test, vi } from 'vitest'
import { createAppError } from '@/test/fixtures/error'

const createMock = vi.fn<(...args: never[]) => Promise<unknown>>()
const getByIdMock = vi.fn<(...args: never[]) => Promise<unknown>>()
const listMock = vi.fn<(...args: never[]) => Promise<unknown>>()
const listRecentMock = vi.fn<(...args: never[]) => Promise<unknown>>()
const listTrashedMock = vi.fn<(...args: never[]) => Promise<unknown>>()
const openMock = vi.fn<(...args: never[]) => Promise<unknown>>()
const renameMock = vi.fn<(...args: never[]) => Promise<unknown>>()
const moveToTrashMock = vi.fn<(...args: never[]) => Promise<unknown>>()
const restoreMock = vi.fn<(...args: never[]) => Promise<unknown>>()

vi.mock('@/repositories', () => ({
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

		createMock.mockResolvedValue({
			ok: true,
			data: { id: 'doc-1' },
		})
		getByIdMock.mockResolvedValue({
			ok: true,
			data: { id: 'doc-1' },
		})
		listMock.mockResolvedValue({
			ok: true,
			data: [],
		})
		listRecentMock.mockResolvedValue({
			ok: true,
			data: [],
		})
		listTrashedMock.mockResolvedValue({
			ok: true,
			data: [],
		})
		openMock.mockResolvedValue({
			ok: true,
			data: { id: 'doc-1' },
		})
		renameMock.mockResolvedValue({
			ok: true,
			data: { id: 'doc-1' },
		})
		moveToTrashMock.mockResolvedValue({
			ok: true,
			data: { id: 'doc-1' },
		})
		restoreMock.mockResolvedValue({
			ok: true,
			data: { id: 'doc-1' },
		})
	})

	test('create 应委托到 documentRepository.create', async () => {
		const { documentService } = await import('./document.service')

		await documentService.create('新文档')

		expect(createMock).toHaveBeenCalledWith('新文档')
	})

	test('getById 应委托到 documentRepository.getById', async () => {
		const { documentService } = await import('./document.service')

		await documentService.getById('doc-1')

		expect(getByIdMock).toHaveBeenCalledWith('doc-1')
	})

	test('list/listRecent/listTrashed 应委托到列表 repository', async () => {
		const { documentService } = await import('./document.service')

		await documentService.list()
		await documentService.listRecent()
		await documentService.listTrashed()

		expect(listMock).toHaveBeenCalledTimes(1)
		expect(listRecentMock).toHaveBeenCalledTimes(1)
		expect(listTrashedMock).toHaveBeenCalledTimes(1)
	})

	test('open/rename/moveToTrash/restore 应透传 repository 返回值', async () => {
		const { documentService } = await import('./document.service')
		const failureResult = {
			ok: false,
			error: createAppError({
				code: 'IO_ERROR',
				message: '失败',
				module: 'document-repository',
				operation: 'open',
			}),
		}

		openMock
			.mockResolvedValueOnce(failureResult)
		renameMock
			.mockResolvedValueOnce(failureResult)
		moveToTrashMock
			.mockResolvedValueOnce(failureResult)
		restoreMock
			.mockResolvedValueOnce(failureResult)

		expect(await documentService.open('doc-open')).toBe(failureResult)
		expect(await documentService.rename('doc-rename', '标题')).toBe(failureResult)
		expect(await documentService.moveToTrash('doc-trash')).toBe(failureResult)
		expect(await documentService.restore('doc-restore')).toBe(failureResult)

		expect(openMock).toHaveBeenCalledWith('doc-open')
		expect(renameMock).toHaveBeenCalledWith('doc-rename', '标题')
		expect(moveToTrashMock).toHaveBeenCalledWith('doc-trash')
		expect(restoreMock).toHaveBeenCalledWith('doc-restore')
	})
})
