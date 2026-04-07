import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, test, vi } from 'vitest'

const { detectDesktopShellPlatformMock } = vi.hoisted(() => ({
	detectDesktopShellPlatformMock: vi.fn<() => 'mac' | 'windows' | 'other'>(),
}))

vi.mock('@/app/chrome/platform-shell', () => ({
	detectDesktopShellPlatform: detectDesktopShellPlatformMock,
}))

vi.mock('@/app/chrome', () => ({
	WindowChrome: () => <div data-testid='window-chrome-stub'>顶栏搜索条</div>,
}))

vi.mock('@/app/navigation', () => ({
	WorkspaceNav: () => <nav>工作区导航</nav>,
	WorkspaceTopbar: () => <div>工作区顶栏</div>,
}))

describe('WorkspaceLayout', () => {
	test('workspace 主内容列应继续渲染顶部工具栏', async () => {
		detectDesktopShellPlatformMock.mockReturnValue('mac')
		const { default: WorkspaceLayout } = await import('./WorkspaceLayout')

		render(
			<MemoryRouter initialEntries={['/workspace/home']}>
				<WorkspaceLayout />
			</MemoryRouter>,
		)

		expect(screen.getByTestId('window-chrome-stub')).toBeInTheDocument()
	})

	test('mac 平台应给 sidebar 顶部品牌区预留 traffic lights 空间', async () => {
		detectDesktopShellPlatformMock.mockReturnValue('mac')
		const { default: WorkspaceLayout } = await import('./WorkspaceLayout')

		render(
			<MemoryRouter initialEntries={['/workspace/home']}>
				<WorkspaceLayout />
			</MemoryRouter>,
		)

		expect(screen.getByTestId('workspace-sidebar-brand')).toHaveClass('pl-16')
	})
})
