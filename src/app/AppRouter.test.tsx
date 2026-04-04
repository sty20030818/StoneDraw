import type { ReactNode } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { resetHashRoute, setHashRoute } from '@/test/helpers/hash-route'

vi.mock('@/pages', () => ({
	ArchivePage: () => <div>归档页面</div>,
	DocumentsPage: () => <div>文档页面</div>,
	HomePage: () => <div>首页页面</div>,
	NotFoundPage: () => <div>未命中页面</div>,
	SearchCenterPage: () => <div>搜索页面</div>,
	SettingsPage: () => <div>设置页面</div>,
	TeamPage: () => <div>团队页面</div>,
	TemplatesPage: () => <div>模板页面</div>,
	WorkbenchPage: () => <div>工作台页面</div>,
}))

vi.mock('@/app/layouts', async () => {
	const { Outlet } = await import('react-router-dom')
	return {
		WorkspaceLayout: () => (
			<div>
				<div>工作区布局</div>
				<Outlet />
			</div>
		),
		WorkbenchLayout: () => (
			<div>
				<div>工作台布局</div>
				<Outlet />
			</div>
		),
		AppShell: ({ children }: { children: ReactNode }) => <div>{children}</div>,
		OverlayRoot: () => null,
	}
})

describe('AppRouter', () => {
	beforeEach(() => {
		resetHashRoute()
	})

	test('根路由应重定向到 Workspace 首页', async () => {
		setHashRoute('/')
		const { default: AppRouter } = await import('./AppRouter')

		render(<AppRouter />)

		expect(await screen.findByText('首页页面')).toBeInTheDocument()
		expect(screen.getByText('工作区布局')).toBeInTheDocument()
	})

	test('Workspace 设置路由应渲染设置页', async () => {
		setHashRoute('/workspace/settings')
		const { default: AppRouter } = await import('./AppRouter')

		render(<AppRouter />)

		expect(await screen.findByText('设置页面')).toBeInTheDocument()
		expect(screen.getByText('工作区布局')).toBeInTheDocument()
	})

	test('Workbench 路由应渲染工作台页', async () => {
		setHashRoute('/workbench?documentId=doc-router-1')
		const { default: AppRouter } = await import('./AppRouter')

		render(<AppRouter />)

		expect(await screen.findByText('工作台页面')).toBeInTheDocument()
		expect(screen.getByText('工作台布局')).toBeInTheDocument()
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
