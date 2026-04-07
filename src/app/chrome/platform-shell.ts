export type DesktopShellPlatform = 'mac' | 'windows' | 'other'

export function detectDesktopShellPlatform(): DesktopShellPlatform {
	if (typeof navigator === 'undefined') {
		return 'other'
	}

	const navigatorWithUserAgentData = navigator as Navigator & {
		userAgentData?: {
			platform?: string
		}
	}

	const platformCandidate =
		navigatorWithUserAgentData.userAgentData?.platform ??
		navigator.platform ??
		navigator.userAgent

	const normalizedPlatform = platformCandidate.toLowerCase()

	if (normalizedPlatform.includes('mac')) {
		return 'mac'
	}

	if (normalizedPlatform.includes('win')) {
		return 'windows'
	}

	return 'other'
}
