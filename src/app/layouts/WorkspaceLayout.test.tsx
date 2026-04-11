import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, test, vi } from 'vitest'

vi.mock('@/app/shell', () => ({
	AppShellHeader: () => <div data-testid='app-shell-header-stub'>顶栏搜索条</div>,
}))

vi.mock('@/app/navigation', () => ({
	WorkspaceNav: () => <nav>工作区导航</nav>,
}))

describe('WorkspaceLayout', () => {
	test('workspace 应渲染统一应用顶栏', async () => {
		const { default: WorkspaceLayout } = await import('./WorkspaceLayout')

		render(
			<MemoryRouter initialEntries={['/workspace/home']}>
				<WorkspaceLayout />
			</MemoryRouter>,
		)

		expect(screen.getByTestId('app-shell-header-stub')).toBeInTheDocument()
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
