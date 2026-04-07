import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, extname, join, relative, resolve } from 'node:path'
import { projectRoot, sourceFileExtensions } from './config'

export function normalizePath(filePath: string) {
	return relative(projectRoot, filePath).replaceAll('\\', '/')
}

export function collectSourceFiles(directoryPath: string): string[] {
	if (!existsSync(directoryPath) || !statSync(directoryPath).isDirectory()) {
		return []
	}

	const files: string[] = []

	for (const entry of readdirSync(directoryPath, { withFileTypes: true })) {
		const entryPath = join(directoryPath, entry.name)

		if (entry.isDirectory()) {
			files.push(...collectSourceFiles(entryPath))
			continue
		}

		if (!sourceFileExtensions.has(extname(entry.name))) {
			continue
		}

		files.push(entryPath)
	}

	return files
}

export function readSourceFile(filePath: string) {
	return readFileSync(filePath, 'utf8')
}

export function resolveModuleReference(filePath: string, specifier: string) {
	const absoluteSpecifier = resolve(dirname(filePath), specifier)
	const candidates = [
		absoluteSpecifier,
		`${absoluteSpecifier}.ts`,
		`${absoluteSpecifier}.tsx`,
		join(absoluteSpecifier, 'index.ts'),
		join(absoluteSpecifier, 'index.tsx'),
	]

	return candidates.find((candidate) => existsSync(candidate)) ?? null
}
