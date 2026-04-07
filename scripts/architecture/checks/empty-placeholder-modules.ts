import { srcRoot, emptyPlaceholderAllowlist, type Violation } from '../config'
import { collectSourceFiles, normalizePath, readSourceFile } from '../collect'

export function collectViolationsForEmptyPlaceholderModules(): Violation[] {
	const violations: Violation[] = []

	for (const filePath of collectSourceFiles(srcRoot)) {
		const normalizedFilePath = normalizePath(filePath)
		const content = readSourceFile(filePath).trim()

		if (content !== 'export {}') {
			continue
		}

		if (emptyPlaceholderAllowlist.has(normalizedFilePath)) {
			continue
		}

		violations.push({
			file: normalizedFilePath,
			reason: '空壳占位模块必须删除、补实现或从公开入口移除。',
		})
	}

	return violations
}
