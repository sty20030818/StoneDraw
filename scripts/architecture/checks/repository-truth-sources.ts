import { existsSync, readFileSync } from 'node:fs'
import { repositoryTruthSourceFiles, repositoryTruthSourceRules, type Violation } from '../config'
import { normalizePath } from '../collect'

export function collectViolationsForRepositoryTruthSources(): Violation[] {
	const violations: Violation[] = []

	for (const filePath of repositoryTruthSourceFiles) {
		if (!existsSync(filePath)) {
			continue
		}

		const content = readFileSync(filePath, 'utf8')

		for (const rule of repositoryTruthSourceRules) {
			if (!rule.pattern.test(content)) {
				continue
			}

			violations.push({
				file: normalizePath(filePath),
				reason: rule.reason,
			})
		}
	}

	return violations
}
