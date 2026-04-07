import { frozenLegacyRoots, orphanWrapperAllowlist, type Violation } from '../config'
import { collectSourceFiles, normalizePath, readSourceFile } from '../collect'

const wrapperPattern = /^export\s+(?:type\s+)?\{[^}]+\}\s+from\s+['"][^'"]+['"];?$/

export function collectViolationsForOrphanWrappers(): Violation[] {
	const violations: Violation[] = []

	for (const root of frozenLegacyRoots) {
		for (const filePath of collectSourceFiles(root)) {
			const normalizedFilePath = normalizePath(filePath)
			const lines = readSourceFile(filePath)
				.split('\n')
				.map((line) => line.trim())
				.filter(Boolean)

			if (lines.length !== 1 || !wrapperPattern.test(lines[0])) {
				continue
			}

			if (orphanWrapperAllowlist.has(normalizedFilePath)) {
				continue
			}

			violations.push({
				file: normalizedFilePath,
				reason: 'legacy wrapper 必须迁移到正式公开入口或直接删除。',
			})
		}
	}

	return violations
}
