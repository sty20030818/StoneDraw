import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { APP_ROUTES } from '@/constants/routes'
import { renderRoute } from '@/test/helpers/render-route'
import SettingsPage from './SettingsPage'

const {
	readMock,
	toastSuccessMock,
} = vi.hoisted(() => ({
	readMock: vi.fn<(...args: never[]) => Promise<unknown>>(),
	toastSuccessMock: vi.fn<(message?: unknown) => unknown>(),
}))

vi.mock('sonner', () => ({
	toast: {
		success: toastSuccessMock,
	},
}))

vi.mock('@/services', async () => {
	const actual = await vi.importActual<typeof import('@/services')>('@/services')
	return {
		...actual,
		settingsService: {
			getDefaults: actual.settingsService.getDefaults,
			read: readMock,
			save: vi.fn<(...args: never[]) => Promise<unknown>>(),
		},
	}
})

function renderSettingsPage() {
	return renderRoute({
		initialEntry: APP_ROUTES.WORKSPACE_SETTINGS,
		routes: [
			{
				path: APP_ROUTES.WORKSPACE_SETTINGS,
				element: <SettingsPage />,
			},
		],
	})
}

describe('SettingsPage', () => {
	beforeEach(() => {
		readMock.mockReset()
		toastSuccessMock.mockReset()
		readMock.mockResolvedValue({
			ok: true,
			data: {
				language: 'zh-CN',
				theme: 'system',
			},
		})
	})

	test('应渲染默认设置并支持打开说明弹窗和确认弹窗', async () => {
		const user = userEvent.setup()

		renderSettingsPage()

		expect(screen.getByText('设置中心')).toBeInTheDocument()
		expect(screen.getByText('zh-CN')).toBeInTheDocument()
		expect(screen.getByText('system')).toBeInTheDocument()

		await user.click(screen.getByRole('button', { name: '打开说明弹窗' }))
		expect(await screen.findByText('说明弹窗已接通')).toBeInTheDocument()

		await user.click(screen.getByRole('button', { name: '关闭' }))
		await user.click(screen.getByRole('button', { name: '打开确认弹窗' }))
		expect(await screen.findByRole('button', { name: '确认' })).toBeInTheDocument()
	})

	test('切换 loading 与触发设置读取应反馈正确', async () => {
		const user = userEvent.setup()

		renderSettingsPage()

		await user.click(screen.getByRole('button', { name: '切换 Loading 状态' }))
		expect(await screen.findByText('正在准备设置数据')).toBeInTheDocument()

		await user.click(screen.getByRole('button', { name: '触发设置读取' }))

		await waitFor(() => {
			expect(readMock).toHaveBeenCalledTimes(1)
			expect(toastSuccessMock).toHaveBeenCalledWith('设置读取成功。')
		})
	})
})
