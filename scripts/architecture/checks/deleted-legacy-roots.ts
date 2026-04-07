import type { Violation } from '../config'
import { deletedLegacyRoots } from '../config'
import { collectSourceFiles, normalizePath } from '../collect'

export function collectViolationsForDeletedRoots(): Violation[] {
	const violations: Violation[] = []

	for (const root of deletedLegacyRoots) {
		for (const filePath of collectSourceFiles(root)) {
			violations.push({
				file: normalizePath(filePath),
				reason: '该旧目录已经删除，不允许重新出现源码文件。',
			})
		}
	}

	return violations
}
