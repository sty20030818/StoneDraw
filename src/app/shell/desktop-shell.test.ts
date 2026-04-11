// @vitest-environment jsdom

import { afterEach, describe, expect, test, vi } from 'vitest'
import { detectDesktopShellPlatform } from './desktop-shell'

function mockNavigatorPlatform(value: string) {
	Object.defineProperty(globalThis.navigator, 'platform', {
		configurable: true,
		value,
	})
}

describe('desktop-shell', () => {
	const originalPlatform = globalThis.navigator.platform

	afterEach(() => {
		Object.defineProperty(globalThis.navigator, 'platform', {
			configurable: true,
			value: originalPlatform,
		})
		vi.unstubAllGlobals()
	})

	test('mac 平台应识别为 mac', () => {
		mockNavigatorPlatform('MacIntel')

		expect(detectDesktopShellPlatform()).toBe('mac')
	})

	test('windows 平台应识别为 windows', () => {
		mockNavigatorPlatform('Win32')

		expect(detectDesktopShellPlatform()).toBe('windows')
	})
})
