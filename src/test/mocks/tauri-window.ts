import { vi } from 'vitest'

type CloseHandler = (event: { preventDefault: () => void }) => void | Promise<void>

export function createTauriWindowMock() {
	let closeHandler: CloseHandler | null = null

	return {
		window: {
			onCloseRequested: vi.fn<(handler: CloseHandler) => Promise<() => void>>(async (handler) => {
				closeHandler = handler
				return () => {
					closeHandler = null
				}
			}),
			destroy: vi.fn<() => Promise<void>>(async () => undefined),
		},
		getCloseHandler() {
			return closeHandler
		},
	}
}
