import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { resetHashRoute, setHashRoute } from '@/test/helpers/hash-route'

vi.mock('@/pages', () => ({
	LegacyEditorPage: () => <div>编辑器页面</div>,
	LegacySettingsPage: () => <div>设置页面</div>,
	LegacyWorkspacePage: () => <div>工作区页面</div>,
	NotFoundPage: () => <div>未命中页面</div>,
}))

vi.mock('@/components/layout', async () => {
	const { Outlet } = await import('react-router-dom')
	return {
		LegacyAppLayout: () => (
			<div>
				<div>应用布局</div>
				<Outlet />
			</div>
		),
		LegacyWorkspaceLayout: () => (
			<div>
				<div>工作区布局</div>
				<Outlet />
			</div>
		),
		LegacyEditorLayout: () => (
			<div>
				<div>编辑器布局</div>
				<Outlet />
			</div>
		),
	}
})

describe('AppRouter', () => {
	beforeEach(() => {
		resetHashRoute()
	})

	test('根路由应重定向到工作区', async () => {
		setHashRoute('/')
		const { default: AppRouter } = await import('./AppRouter')

		render(<AppRouter />)

		expect(await screen.findByText('工作区页面')).toBeInTheDocument()
		expect(screen.getByText('应用布局')).toBeInTheDocument()
		expect(screen.getByText('工作区布局')).toBeInTheDocument()
	})

	test('设置路由应渲染设置页', async () => {
		setHashRoute('/settings')
		const { default: AppRouter } = await import('./AppRouter')

		render(<AppRouter />)

		expect(await screen.findByText('设置页面')).toBeInTheDocument()
		expect(screen.getByText('工作区布局')).toBeInTheDocument()
	})

	test('编辑器路由应渲染编辑器页', async () => {
		setHashRoute('/editor?documentId=doc-router-1')
		const { default: AppRouter } = await import('./AppRouter')

		render(<AppRouter />)

		expect(await screen.findByText('编辑器页面')).toBeInTheDocument()
		expect(screen.getByText('编辑器布局')).toBeInTheDocument()
	})

	test('未知路由应渲染兜底页', async () => {
		setHashRoute('/missing')
		const { default: AppRouter } = await import('./AppRouter')

		render(<AppRouter />)

		await waitFor(() => {
			expect(screen.getByText('未命中页面')).toBeInTheDocument()
		})
	})
})
