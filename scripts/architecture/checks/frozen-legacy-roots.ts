import type { Violation } from '../config'
import { frozenLegacyFileAllowlist, frozenLegacyRoots } from '../config'
import { collectSourceFiles, normalizePath } from '../collect'

export function collectViolationsForFrozenRoots(): Violation[] {
	const violations: Violation[] = []

	for (const root of frozenLegacyRoots) {
		for (const filePath of collectSourceFiles(root)) {
			const normalizedFilePath = normalizePath(filePath)

			if (frozenLegacyFileAllowlist.has(normalizedFilePath)) {
				continue
			}

			violations.push({
				file: normalizedFilePath,
				reason: '该文件不在 legacy 冻结白名单中，新的真相源不得继续落在旧顶层目录。',
			})
		}
	}

	return violations
}
