import { srcRoot, type Violation } from '../config'
import { collectSourceFiles, normalizePath, readSourceFile, resolveModuleReference } from '../collect'

const staticModuleReferencePattern =
	/(?:import|export)\s+(?:type\s+)?(?:[^'"]*?)from\s+['"](\.[^'"]+)['"]/g
const dynamicModuleReferencePattern = /import\(\s*['"](\.[^'"]+)['"]\s*\)/g

export function collectViolationsForBrokenModuleReferences(): Violation[] {
	const violations: Violation[] = []

	for (const filePath of collectSourceFiles(srcRoot)) {
		const content = readSourceFile(filePath)
		const specifiers = new Set<string>()

		for (const match of content.matchAll(staticModuleReferencePattern)) {
			specifiers.add(match[1])
		}

		for (const match of content.matchAll(dynamicModuleReferencePattern)) {
			specifiers.add(match[1])
		}

		for (const specifier of specifiers) {
			if (resolveModuleReference(filePath, specifier)) {
				continue
			}

			violations.push({
				file: normalizePath(filePath),
				reason: `相对路径模块引用失效：${specifier}`,
			})
		}
	}

	return violations
}
