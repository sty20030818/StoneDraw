import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, test, vi } from 'vitest'

vi.mock('@/app/chrome', () => ({
	WindowChrome: () => <div data-testid='window-chrome-stub'>顶栏搜索条</div>,
}))

vi.mock('@/app/navigation', () => ({
	WorkspaceNav: () => <nav>工作区导航</nav>,
	WorkspaceTopbar: () => <div>工作区顶栏</div>,
}))

describe('WorkspaceLayout', () => {
	test('workspace 主内容列应继续渲染顶部工具栏', async () => {
		const { default: WorkspaceLayout } = await import('./WorkspaceLayout')

		render(
			<MemoryRouter initialEntries={['/workspace/home']}>
				<WorkspaceLayout />
			</MemoryRouter>,
		)

		expect(screen.getByTestId('window-chrome-stub')).toBeInTheDocument()
	})

	test('workspace 左侧栏不应再保留独立品牌头', async () => {
		const { default: WorkspaceLayout } = await import('./WorkspaceLayout')

		render(
			<MemoryRouter initialEntries={['/workspace/home']}>
				<WorkspaceLayout />
			</MemoryRouter>,
		)

		expect(screen.queryByTestId('workspace-nav-brand')).not.toBeInTheDocument()
		expect(screen.getByText('工作区导航')).toBeInTheDocument()
	})
})
