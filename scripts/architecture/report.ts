import type { Violation } from './config'

export function printViolations(title: string, violations: Violation[]) {
	if (violations.length === 0) {
		return
	}

	console.error(title)

	for (const violation of violations) {
		console.error(`- ${violation.file}: ${violation.reason}`)
	}
}
