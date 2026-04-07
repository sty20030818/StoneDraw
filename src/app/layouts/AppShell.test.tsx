import { render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

const { detectDesktopShellPlatformMock } = vi.hoisted(() => ({
	detectDesktopShellPlatformMock: vi.fn<() => 'mac' | 'windows' | 'other'>(),
}))

vi.mock('@/app/chrome/platform-shell', () => ({
	detectDesktopShellPlatform: detectDesktopShellPlatformMock,
}))

vi.mock('@/shared/components/AppToaster', () => ({
	default: () => <div>Toast 容器</div>,
}))

describe('AppShell', () => {
	test('windows 壳层应只保留内容容器', async () => {
		detectDesktopShellPlatformMock.mockReturnValue('windows')
		const { default: AppShell } = await import('./AppShell')

		render(
			<AppShell>
				<div>内容区</div>
			</AppShell>,
		)

		expect(screen.getByTestId('app-shell-root')).toBeInTheDocument()
	})

	test('mac 壳层应只保留内容容器', async () => {
		detectDesktopShellPlatformMock.mockReturnValue('mac')
		const { default: AppShell } = await import('./AppShell')

		render(
			<AppShell>
				<div>内容区</div>
			</AppShell>,
		)

		expect(screen.getByTestId('app-shell-root')).toBeInTheDocument()
	})

	test('windows 壳层应保持直角容器', async () => {
		detectDesktopShellPlatformMock.mockReturnValue('windows')
		const { default: AppShell } = await import('./AppShell')

		render(
			<AppShell>
				<div>内容区</div>
			</AppShell>,
		)

		expect(screen.getByTestId('app-shell-root')).not.toHaveClass('rounded-[14px]')
	})
})
