import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { APP_ROUTES } from '@/constants/routes'
import { createDocumentMeta } from '@/test/fixtures/document'
import { renderRoute } from '@/test/helpers/render-route'
import WorkspacePage from './WorkspacePage'

const {
	createMock,
	listMock,
	listRecentMock,
	listTrashedMock,
	openMock,
	renameMock,
	moveToTrashMock,
	restoreMock,
	toastMock,
} = vi.hoisted(() => ({
	createMock: vi.fn<(...args: never[]) => Promise<unknown>>(),
	listMock: vi.fn<(...args: never[]) => Promise<unknown>>(),
	listRecentMock: vi.fn<(...args: never[]) => Promise<unknown>>(),
	listTrashedMock: vi.fn<(...args: never[]) => Promise<unknown>>(),
	openMock: vi.fn<(...args: never[]) => Promise<unknown>>(),
	renameMock: vi.fn<(...args: never[]) => Promise<unknown>>(),
	moveToTrashMock: vi.fn<(...args: never[]) => Promise<unknown>>(),
	restoreMock: vi.fn<(...args: never[]) => Promise<unknown>>(),
	toastMock: vi.fn<(message?: unknown, options?: unknown) => unknown>(),
}))

vi.mock('sonner', () => ({
	toast: Object.assign(toastMock, {
		error: toastMock,
		success: toastMock,
	}),
}))

vi.mock('@/services/document.service', () => ({
	documentService: {
		create: createMock,
		list: listMock,
		listRecent: listRecentMock,
		listTrashed: listTrashedMock,
		open: openMock,
		rename: renameMock,
		moveToTrash: moveToTrashMock,
		restore: restoreMock,
	},
}))

function renderWorkspacePage() {
	return renderRoute({
		initialEntry: APP_ROUTES.WORKSPACE,
		routes: [
			{
				path: APP_ROUTES.WORKSPACE,
				element: <WorkspacePage />,
			},
			{
				path: APP_ROUTES.EDITOR,
				element: <div>编辑器占位</div>,
			},
			{
				path: APP_ROUTES.SETTINGS,
				element: <div>设置页占位</div>,
			},
		],
	})
}

describe('WorkspacePage', () => {
	beforeEach(() => {
		const document = createDocumentMeta({
			id: 'doc-workspace-1',
			title: '工作区文档',
		})

		createMock.mockReset()
		listMock.mockReset()
		listRecentMock.mockReset()
		listTrashedMock.mockReset()
		openMock.mockReset()
		renameMock.mockReset()
		moveToTrashMock.mockReset()
		restoreMock.mockReset()
		toastMock.mockReset()

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
		createMock.mockResolvedValue({
			ok: true,
			data: createDocumentMeta({
				id: 'doc-workspace-new',
				title: '未命名文档',
			}),
		})
	})

	test('首次加载应展示文档列表与最近打开', async () => {
		renderWorkspacePage()

		expect((await screen.findAllByText('工作区文档')).length).toBeGreaterThan(0)
		expect(screen.getByText('最近打开')).toBeInTheDocument()
		expect(listMock).toHaveBeenCalledTimes(1)
		expect(listRecentMock).toHaveBeenCalledTimes(1)
		expect(listTrashedMock).toHaveBeenCalledTimes(1)
	})

	test('点击新建文档后应跳转到编辑器入口', async () => {
		const user = userEvent.setup()

		renderWorkspacePage()
		await screen.findAllByText('工作区文档')

		await user.click(screen.getByRole('button', { name: '新建文档' }))

		await waitFor(() => {
			expect(createMock).toHaveBeenCalledWith('未命名文档')
			expect(screen.getByText('编辑器占位')).toBeInTheDocument()
		})
	})

	test('点击文档卡片时应调用打开命令并进入编辑器', async () => {
		const user = userEvent.setup()

		renderWorkspacePage()
		await screen.findAllByText('工作区文档')

		await user.click(screen.getAllByText('工作区文档')[0])

		await waitFor(() => {
			expect(openMock).toHaveBeenCalledWith('doc-workspace-1')
			expect(screen.getByText('编辑器占位')).toBeInTheDocument()
		})
	})

	test('文档列表加载失败时应显示错误空态', async () => {
		listMock.mockResolvedValueOnce({
			ok: false,
			error: {
				code: 'UNKNOWN_ERROR',
				message: '读取失败',
			},
		})

		renderWorkspacePage()

		expect(await screen.findByText('文档列表读取失败')).toBeInTheDocument()
		expect(screen.getAllByText(/读取失败/).length).toBeGreaterThan(0)
	})

	test('打开文档失败时应通过 toast 提示错误', async () => {
		const user = userEvent.setup()
		openMock.mockResolvedValueOnce({
			ok: false,
			error: {
				code: 'UNKNOWN_ERROR',
				message: '打开失败',
			},
		})

		renderWorkspacePage()
		await screen.findAllByText('工作区文档')

		await user.click(screen.getAllByText('工作区文档')[0])

		await waitFor(() => {
			expect(toastMock).toHaveBeenCalledWith('打开失败')
		})
	})

	test('没有文档时应展示空状态并支持从空状态新建', async () => {
		const user = userEvent.setup()
		listMock.mockResolvedValueOnce({
			ok: true,
			data: [],
		})
		listRecentMock.mockResolvedValueOnce({
			ok: true,
			data: [],
		})

		renderWorkspacePage()

		expect(await screen.findByText('还没有文档')).toBeInTheDocument()

		await user.click(screen.getByRole('button', { name: '新建第一份文档' }))

		await waitFor(() => {
			expect(createMock).toHaveBeenCalledWith('未命名文档')
			expect(screen.getByText('编辑器占位')).toBeInTheDocument()
		})
	})

	test('重命名文档成功后应调用命令并提示成功', async () => {
		const user = userEvent.setup()
		renameMock.mockResolvedValueOnce({
			ok: true,
			data: createDocumentMeta({
				id: 'doc-workspace-1',
				title: '工作区文档-新标题',
			}),
		})

		renderWorkspacePage()
		await screen.findAllByText('工作区文档')

		await user.click(screen.getByRole('button', { name: '更多操作' }))
		await user.click(screen.getByRole('button', { name: '重命名' }))
		await user.clear(screen.getByPlaceholderText('输入新的文档标题'))
		await user.type(screen.getByPlaceholderText('输入新的文档标题'), '工作区文档-新标题')
		await user.click(screen.getByRole('button', { name: '保存标题' }))

		await waitFor(() => {
			expect(renameMock).toHaveBeenCalledWith('doc-workspace-1', '工作区文档-新标题')
			expect(toastMock).toHaveBeenCalledWith('文档标题已更新。')
		})
	})

	test('删除到回收站时应先确认再执行移动', async () => {
		const user = userEvent.setup()
		moveToTrashMock.mockResolvedValueOnce({
			ok: true,
			data: createDocumentMeta({
				id: 'doc-workspace-1',
				isDeleted: true,
				deletedAt: 2,
			}),
		})

		renderWorkspacePage()
		await screen.findAllByText('工作区文档')

		await user.click(screen.getByRole('button', { name: '更多操作' }))
		await user.click(screen.getByRole('button', { name: '删除到回收站' }))
		expect(await screen.findByRole('button', { name: '移入回收站' })).toBeInTheDocument()

		await user.click(screen.getByRole('button', { name: '移入回收站' }))

		await waitFor(() => {
			expect(moveToTrashMock).toHaveBeenCalledWith('doc-workspace-1')
			expect(toastMock).toHaveBeenCalledWith('已将《工作区文档》移动到回收站。')
		})
	})

	test('回收站文档应支持恢复', async () => {
		const user = userEvent.setup()
		listTrashedMock.mockResolvedValueOnce({
			ok: true,
			data: [
				createDocumentMeta({
					id: 'doc-trashed-1',
					title: '已删除文档',
					isDeleted: true,
					deletedAt: 2,
				}),
			],
		})
		restoreMock.mockResolvedValueOnce({
			ok: true,
			data: createDocumentMeta({
				id: 'doc-trashed-1',
				title: '已删除文档',
				isDeleted: false,
			}),
		})

		renderWorkspacePage()

		expect(await screen.findByText('已删除文档')).toBeInTheDocument()

		await user.click(screen.getByRole('button', { name: '恢复文档' }))

		await waitFor(() => {
			expect(restoreMock).toHaveBeenCalledWith('doc-trashed-1')
			expect(toastMock).toHaveBeenCalledWith('已恢复《已删除文档》。')
		})
	})
})
