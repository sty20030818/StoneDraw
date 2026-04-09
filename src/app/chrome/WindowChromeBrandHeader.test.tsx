import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

const { detectDesktopShellPlatformMock } = vi.hoisted(() => ({
	detectDesktopShellPlatformMock: vi.fn<() => 'mac' | 'windows' | 'other'>(),
}))

vi.mock('./platform-shell', () => ({
	detectDesktopShellPlatform: detectDesktopShellPlatformMock,
}))

describe('WindowChromeBrandHeader', () => {
	beforeEach(() => {
		detectDesktopShellPlatformMock.mockReset()
	})

	test('mac 品牌头应预留 traffic light 安全区', async () => {
		detectDesktopShellPlatformMock.mockReturnValue('mac')
		const { default: WindowChromeBrandHeader } = await import('./WindowChromeBrandHeader')

		render(<WindowChromeBrandHeader />)

		expect(screen.getByTestId('window-chrome-brand-header')).toHaveClass('pl-20')
		expect(screen.getByTestId('window-chrome-brand-header')).toHaveAttribute('data-tauri-drag-region')
		expect(screen.getByText('StoneDraw')).toBeInTheDocument()
	})

	test('windows 品牌头应保持常规左右留白', async () => {
		detectDesktopShellPlatformMock.mockReturnValue('windows')
		const { default: WindowChromeBrandHeader } = await import('./WindowChromeBrandHeader')

		render(<WindowChromeBrandHeader />)

		expect(screen.getByTestId('window-chrome-brand-header')).toHaveClass('px-4')
	})

	test('workbench 场景可单独开启品牌头下边线', async () => {
		detectDesktopShellPlatformMock.mockReturnValue('windows')
		const { default: WindowChromeBrandHeader } = await import('./WindowChromeBrandHeader')

		render(<WindowChromeBrandHeader showBottomBorder />)

		expect(screen.getByTestId('window-chrome-brand-header')).toHaveClass('border-b')
	})
})
