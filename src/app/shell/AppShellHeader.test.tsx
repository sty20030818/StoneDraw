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

	test('windows 控制区前的分割线应保留纵向拉伸并只做上下留白', async () => {
		detectDesktopShellPlatformMock.mockReturnValue('windows')
		const { default: AppShellHeader } = await import('./AppShellHeader')

		render(<AppShellHeader scene='workspace' />)

		const separator = screen.getByTestId('windows-window-controls').previousElementSibling

		expect(separator).toHaveClass('my-3')
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
