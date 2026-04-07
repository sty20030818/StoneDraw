import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import type { DocumentVersionMeta, TauriCommandResult } from '@/shared/types'
import { createAppError } from '@/test/fixtures/error'
import { createDocumentVersionMeta } from '@/test/fixtures/version'
import HistoryPanel from './HistoryPanel'

const listDocumentVersionsMock = vi.fn<(...args: never[]) => Promise<unknown>>()
const toastMock = vi.fn<(message?: unknown, options?: unknown) => unknown>()

vi.mock('@/features/documents', () => ({
	versionService: {
		listDocumentVersions: listDocumentVersionsMock,
	},
}))

vi.mock('sonner', () => ({
	toast: Object.assign(toastMock, {
		error: toastMock,
		success: toastMock,
	}),
}))

describe('HistoryPanel', () => {
	beforeEach(() => {
		listDocumentVersionsMock.mockReset()
		toastMock.mockClear()
	})

	test('应展示版本列表加载结果', async () => {
		listDocumentVersionsMock.mockResolvedValue({
			ok: true,
			data: [
				createDocumentVersionMeta({
					id: 'ver-history-1',
					label: '手动版本 3',
					versionNumber: 3,
					createdAt: 1710000000000,
				}),
			],
		})

		render(
			<HistoryPanel
				documentId='doc-history-1'
				documentTitle='历史文档'
				isDocumentReady
				onCreateVersion={vi.fn()}
				saveStatus='saved'
			/>,
		)

		expect(await screen.findByText('手动版本 3')).toBeInTheDocument()
		expect(screen.getByText('版本 #3 · manual')).toBeInTheDocument()
		expect(listDocumentVersionsMock).toHaveBeenCalledWith('doc-history-1')
	})

	test('列表为空时应展示空状态', async () => {
		listDocumentVersionsMock.mockResolvedValue({
			ok: true,
			data: [],
		})

		render(
			<HistoryPanel
				documentId='doc-history-empty'
				documentTitle='空历史文档'
				isDocumentReady
				onCreateVersion={vi.fn()}
				saveStatus='saved'
			/>,
		)

		expect(await screen.findByText('当前文档还没有冻结过手动版本。')).toBeInTheDocument()
	})

	test('列表读取失败时应展示错误态', async () => {
		listDocumentVersionsMock.mockResolvedValue({
			ok: false,
			error: createAppError({
				code: 'DB_ERROR',
				message: '版本列表读取失败',
				details: 'versions table unavailable',
				module: 'version-service',
				operation: 'listDocumentVersions',
			}),
		})

		render(
			<HistoryPanel
				documentId='doc-history-error'
				documentTitle='错误历史文档'
				isDocumentReady
				onCreateVersion={vi.fn()}
				saveStatus='error'
			/>,
		)

		expect(await screen.findByText('读取版本列表失败：versions table unavailable')).toBeInTheDocument()
	})

	test('创建版本成功后应刷新列表并提示成功', async () => {
		const user = userEvent.setup()
		const createdVersion = createDocumentVersionMeta({
			id: 'ver-history-create',
			label: '手动版本 1',
		})
		const onCreateVersionMock = vi.fn<() => Promise<TauriCommandResult<DocumentVersionMeta> | null>>().mockResolvedValue({
			ok: true,
			data: createdVersion,
		})

		listDocumentVersionsMock
			.mockResolvedValueOnce({
				ok: true,
				data: [],
			})
			.mockResolvedValueOnce({
				ok: true,
				data: [createdVersion],
			})

		render(
			<HistoryPanel
				documentId='doc-history-create'
				documentTitle='创建历史文档'
				isDocumentReady
				onCreateVersion={onCreateVersionMock}
				saveStatus='saved'
			/>,
		)

		await screen.findByText('当前文档还没有冻结过手动版本。')
		await user.click(screen.getByRole('button', { name: '创建版本' }))

		await waitFor(() => {
			expect(onCreateVersionMock).toHaveBeenCalledTimes(1)
			expect(listDocumentVersionsMock).toHaveBeenCalledTimes(2)
		})
		expect(await screen.findByText('手动版本 1')).toBeInTheDocument()
		expect(toastMock).toHaveBeenCalledWith('版本已创建', {
			description: '手动版本 1 已冻结到本地历史。',
		})
	})

	test('创建版本失败时应提示错误且不刷新列表', async () => {
		const user = userEvent.setup()
		const onCreateVersionMock = vi.fn<() => Promise<TauriCommandResult<DocumentVersionMeta> | null>>().mockResolvedValue({
			ok: false,
			error: createAppError({
				code: 'DB_ERROR',
				message: '创建版本失败',
				details: 'versions insert failed',
				module: 'version-service',
				operation: 'createManualVersion',
			}),
		})

		listDocumentVersionsMock.mockResolvedValue({
			ok: true,
			data: [],
		})

		render(
			<HistoryPanel
				documentId='doc-history-create-failure'
				documentTitle='失败历史文档'
				isDocumentReady
				onCreateVersion={onCreateVersionMock}
				saveStatus='error'
			/>,
		)

		await screen.findByText('当前文档还没有冻结过手动版本。')
		await user.click(screen.getByRole('button', { name: '创建版本' }))

		await waitFor(() => {
			expect(onCreateVersionMock).toHaveBeenCalledTimes(1)
		})
		expect(listDocumentVersionsMock).toHaveBeenCalledTimes(1)
		expect(toastMock).toHaveBeenCalledWith('创建版本失败', {
			description: 'versions insert failed',
		})
	})
})
