import { beforeEach, describe, expect, test, vi } from 'vitest'
import { TAURI_COMMANDS } from '@/constants'

const invokeTauriCommandMock = vi.fn<(...args: never[]) => Promise<unknown>>()

vi.mock('../tauri.service', () => ({
	invokeTauriCommand: invokeTauriCommandMock,
}))

describe('document.service', () => {
	beforeEach(() => {
		invokeTauriCommandMock.mockReset()
		invokeTauriCommandMock.mockResolvedValue({
			ok: true,
			data: { id: 'doc-1' },
		})
	})

	test('create 应映射创建命令和标题 payload', async () => {
		const { documentService } = await import('./document.service')

		await documentService.create('新文档')

		expect(invokeTauriCommandMock).toHaveBeenCalledWith(TAURI_COMMANDS.DOCUMENTS_CREATE, {
			title: '新文档',
		})
	})

	test('getById 应映射文档查询命令', async () => {
		const { documentService } = await import('./document.service')

		await documentService.getById('doc-1')

		expect(invokeTauriCommandMock).toHaveBeenCalledWith(TAURI_COMMANDS.DOCUMENTS_GET_BY_ID, {
			documentId: 'doc-1',
		})
	})

	test('list/listRecent/listTrashed 应映射对应列表命令', async () => {
		const { documentService } = await import('./document.service')

		await documentService.list()
		await documentService.listRecent()
		await documentService.listTrashed()

		expect(invokeTauriCommandMock).toHaveBeenNthCalledWith(1, TAURI_COMMANDS.DOCUMENTS_LIST)
		expect(invokeTauriCommandMock).toHaveBeenNthCalledWith(2, TAURI_COMMANDS.DOCUMENTS_LIST_RECENT)
		expect(invokeTauriCommandMock).toHaveBeenNthCalledWith(3, TAURI_COMMANDS.DOCUMENTS_LIST_TRASHED)
	})

	test('open/rename/moveToTrash/restore 应透传 payload 与失败结果', async () => {
		const { documentService } = await import('./document.service')
		const failureResult = {
			ok: false,
			error: {
				code: 'IO_ERROR',
				message: '失败',
			},
		}

		invokeTauriCommandMock
			.mockResolvedValueOnce(failureResult)
			.mockResolvedValueOnce(failureResult)
			.mockResolvedValueOnce(failureResult)
			.mockResolvedValueOnce(failureResult)

		expect(await documentService.open('doc-open')).toBe(failureResult)
		expect(await documentService.rename('doc-rename', '标题')).toBe(failureResult)
		expect(await documentService.moveToTrash('doc-trash')).toBe(failureResult)
		expect(await documentService.restore('doc-restore')).toBe(failureResult)

		expect(invokeTauriCommandMock).toHaveBeenNthCalledWith(1, TAURI_COMMANDS.DOCUMENTS_OPEN, {
			documentId: 'doc-open',
		})
		expect(invokeTauriCommandMock).toHaveBeenNthCalledWith(2, TAURI_COMMANDS.DOCUMENTS_RENAME, {
			documentId: 'doc-rename',
			title: '标题',
		})
		expect(invokeTauriCommandMock).toHaveBeenNthCalledWith(3, TAURI_COMMANDS.DOCUMENTS_MOVE_TO_TRASH, {
			documentId: 'doc-trash',
		})
		expect(invokeTauriCommandMock).toHaveBeenNthCalledWith(4, TAURI_COMMANDS.DOCUMENTS_RESTORE, {
			documentId: 'doc-restore',
		})
	})
})
