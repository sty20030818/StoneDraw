import { render, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

const { runBeforeWindowHideHandlerMock, tauriWindowMock } = vi.hoisted(() => {
	let closeHandler: ((event: { preventDefault: () => void }) => Promise<void>) | null = null

	return {
		runBeforeWindowHideHandlerMock: vi.fn<() => Promise<void>>(async () => undefined),
		tauriWindowMock: {
			window: {
				onCloseRequested: vi.fn<(handler: NonNullable<typeof closeHandler>) => Promise<() => void>>(async (handler) => {
					closeHandler = handler

					return () => {
						closeHandler = null
					}
				}),
				hide: vi.fn<() => Promise<void>>(async () => undefined),
			},
			getCloseHandler() {
				return closeHandler
			},
		},
	}
})

vi.mock('@tauri-apps/api/window', () => ({
	getCurrentWindow: () => tauriWindowMock.window,
}))

vi.mock('./window-close-coordinator', () => ({
	runBeforeWindowHideHandler: runBeforeWindowHideHandlerMock,
}))

describe('AppWindowCloseBridge', () => {
	beforeEach(() => {
		runBeforeWindowHideHandlerMock.mockClear()
		tauriWindowMock.window.onCloseRequested.mockClear()
		tauriWindowMock.window.hide.mockClear()
	})

	test('关闭请求应先执行关闭前处理，再隐藏窗口', async () => {
		const { default: AppWindowCloseBridge } = await import('./AppWindowCloseBridge')

		render(<AppWindowCloseBridge />)

		await waitFor(() => {
			expect(tauriWindowMock.getCloseHandler()).toBeTypeOf('function')
		})

		const preventDefault = vi.fn<() => void>()
		await tauriWindowMock.getCloseHandler()?.({ preventDefault })

		expect(preventDefault).toHaveBeenCalledTimes(1)
		expect(runBeforeWindowHideHandlerMock).toHaveBeenCalledTimes(1)
		expect(tauriWindowMock.window.hide).toHaveBeenCalledTimes(1)
	})
})
