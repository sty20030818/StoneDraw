import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test } from 'vitest'
import { APP_ROUTES } from '@/shared/constants/routes'
import { renderRoute } from '@/test/helpers/render-route'
import NotFoundPage from './NotFoundPage'

describe('NotFoundPage', () => {
	test('点击返回工作区后应跳转到工作区', async () => {
		const user = userEvent.setup()

		renderRoute({
			initialEntry: '/missing-page',
			routes: [
				{
					path: '*',
					element: <NotFoundPage />,
				},
				{
					path: APP_ROUTES.WORKSPACE,
					element: <div>工作区落点</div>,
				},
			],
		})

		expect(screen.getByText('页面未找到')).toBeInTheDocument()

		await user.click(screen.getByRole('button', { name: '返回工作区' }))

		expect(await screen.findByText('工作区落点')).toBeInTheDocument()
	})
})
