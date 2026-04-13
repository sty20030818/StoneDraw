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

vi.mock('./desktop-shell', () => ({
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

describe('AppShellHeader', () => {
	beforeEach(() => {
		detectDesktopShellPlatformMock.mockReset()
		openNewDocumentDialogMock.mockReset()
		toastMock.mockReset()
		useAppStore.getState().reset()
	})

	test('windows 自绘标题栏应保留右上角窗口控制区', async () => {
		detectDesktopShellPlatformMock.mockReturnValue('windows')
		const { default: AppShellHeader } = await import('./AppShellHeader')

		render(<AppShellHeader scene='workspace' />)

		expect(screen.getByTestId('windows-window-controls')).toBeInTheDocument()
		expect(screen.getByTestId('app-shell-header-root')).toHaveAttribute('data-tauri-drag-region')
	})

	test('windows 控制区应收窄为居中的紧凑按钮组', async () => {
		detectDesktopShellPlatformMock.mockReturnValue('windows')
		const { default: AppShellHeader } = await import('./AppShellHeader')

		render(<AppShellHeader scene='workspace' />)

		const controls = screen.getByTestId('windows-window-controls')

		expect(controls).toHaveClass('h-10', 'w-31', 'rounded-[10px]', 'border')
		expect(controls).not.toHaveClass('h-full', 'w-34.5')
	})

	test('windows 控制区前的分割线应保留纵向拉伸并增加上下留白', async () => {
		detectDesktopShellPlatformMock.mockReturnValue('windows')
		const { default: AppShellHeader } = await import('./AppShellHeader')

		render(<AppShellHeader scene='workspace' />)

		const separator = screen.getByTestId('windows-window-controls').previousElementSibling

		expect(separator).toHaveClass('my-4')
		expect(separator).not.toHaveClass('h-5', 'self-center')
	})

	test('统一应用顶栏应包含品牌、搜索、导入和新建文档按钮', async () => {
		detectDesktopShellPlatformMock.mockReturnValue('windows')
		const { default: AppShellHeader } = await import('./AppShellHeader')

		render(<AppShellHeader scene='workspace' />)

		expect(screen.getByTestId('app-shell-header-leading')).toBeInTheDocument()
		expect(screen.getByTestId('app-shell-header-search')).toBeInTheDocument()
		expect(screen.getByRole('button', { name: '导入' })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: '新建文档' })).toBeInTheDocument()
	})

	test('顶栏非交互结构层应显式标记为可拖拽区域', async () => {
		detectDesktopShellPlatformMock.mockReturnValue('windows')
		const { default: AppShellHeader } = await import('./AppShellHeader')

		render(<AppShellHeader scene='workspace' />)

		expect(screen.getByTestId('app-shell-header-chrome')).toHaveAttribute('data-tauri-drag-region')
		expect(screen.getByTestId('app-shell-header-chrome')).toHaveClass('app-shell-drag')
		expect(screen.getByTestId('app-shell-header-search-overlay')).toHaveAttribute('data-tauri-drag-region')
		expect(screen.getByTestId('app-shell-header-search-overlay')).toHaveClass('app-shell-drag')
	})

	test('搜索框与两个操作按钮应保持不可拖拽', async () => {
		detectDesktopShellPlatformMock.mockReturnValue('windows')
		const { default: AppShellHeader } = await import('./AppShellHeader')

		render(<AppShellHeader scene='workspace' />)

		expect(screen.getByTestId('app-shell-header-search')).toHaveClass('app-shell-no-drag')
		expect(screen.getByRole('button', { name: '导入' })).toHaveClass('app-shell-no-drag')
		expect(screen.getByRole('button', { name: '新建文档' })).toHaveClass('app-shell-no-drag')
	})

	test('mac 顶栏应保留搜索工具条并移除右侧 win 控制区', async () => {
		detectDesktopShellPlatformMock.mockReturnValue('mac')
		const { default: AppShellHeader } = await import('./AppShellHeader')

		render(<AppShellHeader scene='workbench' />)

		expect(screen.getByTestId('app-shell-header-search')).toBeInTheDocument()
		expect(screen.queryByTestId('windows-window-controls')).not.toBeInTheDocument()
	})

	test('搜索框聚焦后点击顶栏拖拽区应取消高亮', async () => {
		detectDesktopShellPlatformMock.mockReturnValue('windows')
		const { default: AppShellHeader } = await import('./AppShellHeader')

		render(<AppShellHeader scene='workspace' />)

		const searchInput = screen.getByPlaceholderText('搜索文档标题')
		const headerRoot = screen.getByTestId('app-shell-header-root')

		searchInput.focus()
		expect(searchInput).toHaveFocus()

		fireEvent.pointerDown(headerRoot)

		expect(searchInput).not.toHaveFocus()
	})
})
