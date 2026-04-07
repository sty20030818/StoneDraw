import type { Violation } from '../config'
import { guardedImportRoots, guardedImportRules } from '../config'
import { collectSourceFiles, normalizePath, readSourceFile } from '../collect'

export function collectViolationsForGuardedImports(): Violation[] {
	const violations: Violation[] = []

	for (const root of guardedImportRoots) {
		for (const filePath of collectSourceFiles(root)) {
			const content = readSourceFile(filePath)

			for (const rule of guardedImportRules) {
				if (!rule.pattern.test(content)) {
					continue
				}

				violations.push({
					file: normalizePath(filePath),
					reason: rule.reason,
				})
			}
		}
	}

	return violations
}
