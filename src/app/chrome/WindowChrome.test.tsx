import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { useAppStore } from '@/stores/app.store'

const { detectDesktopShellPlatformMock } = vi.hoisted(() => ({
	detectDesktopShellPlatformMock: vi.fn<() => 'mac' | 'windows' | 'other'>(),
}))

vi.mock('@tauri-apps/api/window', () => ({
	getCurrentWindow: vi.fn(() => ({
		minimize: vi.fn(),
		toggleMaximize: vi.fn(),
		close: vi.fn(),
	})),
}))

vi.mock('./platform-shell', () => ({
	detectDesktopShellPlatform: detectDesktopShellPlatformMock,
}))

describe('WindowChrome', () => {
	beforeEach(() => {
		detectDesktopShellPlatformMock.mockReset()
		useAppStore.getState().reset()
	})

	test('windows 自绘标题栏应保留右上角窗口控制区', async () => {
		detectDesktopShellPlatformMock.mockReturnValue('windows')
		const { default: WindowChrome } = await import('./WindowChrome')

		render(<WindowChrome />)

		expect(screen.getByTestId('windows-window-controls')).toBeInTheDocument()
	})

	test('mac overlay 标题栏应保留搜索工具条并移除右侧 win 控制区', async () => {
		detectDesktopShellPlatformMock.mockReturnValue('mac')
		const { default: WindowChrome } = await import('./WindowChrome')

		render(<WindowChrome />)

		expect(screen.getByTestId('mac-window-controls-spacer')).toBeInTheDocument()
		expect(screen.queryByTestId('windows-window-controls')).not.toBeInTheDocument()
	})
})
