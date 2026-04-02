import { afterEach, beforeEach, vi } from 'vitest'
import { resetTestState } from './helpers/reset-state'

type GlobalWithRequestAnimationFrame = typeof globalThis & {
	requestAnimationFrame?: (callback: FrameRequestCallback) => number
}

const globalWithRequestAnimationFrame = globalThis as GlobalWithRequestAnimationFrame

if (!globalWithRequestAnimationFrame.requestAnimationFrame) {
	globalWithRequestAnimationFrame.requestAnimationFrame = (callback) => {
		return setTimeout(() => callback(Date.now()), 0) as unknown as number
	}
}

beforeEach(() => {
	resetTestState()
	vi.clearAllMocks()
	vi.useRealTimers()
})

afterEach(() => {
	vi.clearAllTimers()
	vi.useRealTimers()
	resetTestState()
})
