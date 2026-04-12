type BeforeWindowHideHandler = () => Promise<void> | void

let beforeWindowHideHandler: BeforeWindowHideHandler | null = null

export function registerBeforeWindowHideHandler(handler: BeforeWindowHideHandler) {
	beforeWindowHideHandler = handler

	return () => {
		if (beforeWindowHideHandler === handler) {
			beforeWindowHideHandler = null
		}
	}
}

export async function runBeforeWindowHideHandler() {
	if (!beforeWindowHideHandler) {
		return
	}

	await beforeWindowHideHandler()
}
