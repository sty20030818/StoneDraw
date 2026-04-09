import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { useAppStore } from '@/app/state'

const { detectDesktopShellPlatformMock } = vi.hoisted(() => ({
	detectDesktopShellPlatformMock: vi.fn<() => 'mac' | 'windows' | 'other'>(),
}))

const { openNewDocumentDialogMock, toastMock } = vi.hoisted(() => ({
	openNewDocumentDialogMock: vi.fn<(payload?: Record<string, unknown>) => void>(),
	toastMock: vi.fn<(message: string) => void>(),
}))

vi.mock('@tauri-apps/api/window', () => ({
	getCurrentWindow: vi.fn<
		() => {
			minimize: () => void
			toggleMaximize: () => void
			close: () => void
		}
	>(() => ({
		minimize: vi.fn<() => void>(),
		toggleMaximize: vi.fn<() => void>(),
		close: vi.fn<() => void>(),
	})),
}))

vi.mock('./platform-shell', () => ({
	detectDesktopShellPlatform: detectDesktopShellPlatformMock,
}))

vi.mock('@/features/overlays', () => ({
	useOverlayStore: (selector: (state: { openNewDocumentDialog: typeof openNewDocumentDialogMock }) => unknown) =>
		selector({
			openNewDocumentDialog: openNewDocumentDialogMock,
		}),
}))

vi.mock('sonner', () => ({
	toast: toastMock,
}))

describe('WindowChrome', () => {
	beforeEach(() => {
		detectDesktopShellPlatformMock.mockReset()
		openNewDocumentDialogMock.mockReset()
		toastMock.mockReset()
		useAppStore.getState().reset()
	})

	test('windows 自绘标题栏应保留右上角窗口控制区', async () => {
		detectDesktopShellPlatformMock.mockReturnValue('windows')
		const { default: WindowChrome } = await import('./WindowChrome')

		render(<WindowChrome scene='workspace' />)

		expect(screen.getByTestId('windows-window-controls')).toBeInTheDocument()
		expect(screen.getByTestId('window-chrome-root')).toHaveAttribute('data-tauri-drag-region')
	})

	test('windowchrome 中间操作组应包含搜索、导入和新建文档按钮', async () => {
		detectDesktopShellPlatformMock.mockReturnValue('windows')
		const { default: WindowChrome } = await import('./WindowChrome')

		render(<WindowChrome scene='workspace' />)

		expect(screen.getByTestId('window-chrome-center-actions')).toBeInTheDocument()
		expect(screen.getByPlaceholderText('搜索文档标题')).toHaveClass('h-9')
		expect(screen.getByRole('button', { name: '导入' })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: '新建文档' })).toBeInTheDocument()
	})

	test('windows 关闭按钮 hover 样式应与最小化和最大化按钮区分', async () => {
		detectDesktopShellPlatformMock.mockReturnValue('windows')
		const { default: WindowChrome } = await import('./WindowChrome')

		render(<WindowChrome scene='workspace' />)

		expect(screen.getByTitle('最小化')).toHaveClass('hover:bg-foreground/8', 'hover:text-foreground')
		expect(screen.getByTitle('最大化或还原')).toHaveClass('hover:bg-foreground/8', 'hover:text-foreground')
		expect(screen.getByTitle('关闭')).toHaveClass('hover:bg-destructive', 'hover:text-primary-foreground')
	})

	test('mac overlay 标题栏应保留搜索工具条并移除右侧 win 控制区', async () => {
		detectDesktopShellPlatformMock.mockReturnValue('mac')
		const { default: WindowChrome } = await import('./WindowChrome')

		render(<WindowChrome scene='workbench' />)

		expect(screen.getByTestId('window-chrome-search')).toBeInTheDocument()
		expect(screen.queryByTestId('windows-window-controls')).not.toBeInTheDocument()
	})

	test('搜索框聚焦后点击顶栏拖拽区应取消高亮', async () => {
		detectDesktopShellPlatformMock.mockReturnValue('windows')
		const { default: WindowChrome } = await import('./WindowChrome')

		render(<WindowChrome scene='workspace' />)

		const searchInput = screen.getByPlaceholderText('搜索文档标题')
		const chromeRoot = screen.getByTestId('window-chrome-root')

		searchInput.focus()
		expect(searchInput).toHaveFocus()

		fireEvent.pointerDown(chromeRoot)

		expect(searchInput).not.toHaveFocus()
	})

	test('除搜索与业务按钮外，顶栏其余区域应保持拖拽能力', async () => {
		detectDesktopShellPlatformMock.mockReturnValue('windows')
		const { default: WindowChrome } = await import('./WindowChrome')

		render(<WindowChrome scene='workspace' />)

		expect(screen.getByTestId('window-chrome-search')).toHaveClass('window-chrome-no-drag')
		expect(screen.getByRole('button', { name: '导入' })).toHaveClass('window-chrome-no-drag')
		expect(screen.getByRole('button', { name: '新建文档' })).toHaveClass('window-chrome-no-drag')
		expect(screen.getByTestId('window-chrome-center-actions')).toHaveClass('window-chrome-drag')
	})
})
