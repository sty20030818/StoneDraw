import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, test, vi } from 'vitest'

vi.mock('@/app/chrome', () => ({
	WindowChrome: () => <div data-testid='window-chrome-stub'>顶栏搜索条</div>,
	WindowChromeBrandHeader: () => <div data-testid='window-chrome-brand-header-stub'>品牌头</div>,
}))

vi.mock('@/app/navigation', () => ({
	WorkspaceNav: () => <nav>工作区导航</nav>,
}))

describe('WorkspaceLayout', () => {
	test('workspace 应渲染左侧品牌头与右侧共享 topbar', async () => {
		const { default: WorkspaceLayout } = await import('./WorkspaceLayout')

		render(
			<MemoryRouter initialEntries={['/workspace/home']}>
				<WorkspaceLayout />
			</MemoryRouter>,
		)

		expect(screen.getByTestId('window-chrome-brand-header-stub')).toBeInTheDocument()
		expect(screen.getByTestId('window-chrome-stub')).toBeInTheDocument()
	})

	test('workspace 左侧栏应继续渲染导航内容', async () => {
		const { default: WorkspaceLayout } = await import('./WorkspaceLayout')

		render(
			<MemoryRouter initialEntries={['/workspace/home']}>
				<WorkspaceLayout />
			</MemoryRouter>,
		)

		expect(screen.getByText('工作区导航')).toBeInTheDocument()
	})
})
