export type DeferredPromise<T> = {
	promise: Promise<T>
	resolve: (value: T | PromiseLike<T>) => void
	reject: (reason?: unknown) => void
}

export function createDeferredPromise<T>(): DeferredPromise<T> {
	let resolve!: DeferredPromise<T>['resolve']
	let reject!: DeferredPromise<T>['reject']

	const promise = new Promise<T>((innerResolve, innerReject) => {
		resolve = innerResolve
		reject = innerReject
	})

	return {
		promise,
		resolve,
		reject,
	}
}
