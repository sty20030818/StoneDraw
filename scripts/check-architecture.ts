import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join, relative } from 'node:path'

type Violation = {
	file: string
	reason: string
}

const projectRoot = process.cwd()
const srcRoot = join(projectRoot, 'src')

const pageImportBanRules = [
	{
		pattern: /from ['"]@\/repositories(?:\/|['"])/,
		reason: '页面层不得直接依赖 repositories。',
	},
	{
		pattern: /from ['"]@\/infra(?:\/|['"])/,
		reason: '页面层不得直接依赖 infra。',
	},
	{
		pattern: /from ['"]@\/adapters(?:\/|['"])/,
		reason: '页面层不得直接依赖 adapters。',
	},
	{
		pattern: /from ['"]@tauri-apps\/api\/core['"]/,
		reason: '页面层不得直接调用 Tauri command bridge。',
	},
]

const legacyDirImportBanRules = [
	{
		pattern: /from ['"]@\/services(?:\/|['"])/,
		reason: '旧过渡目录已冻结，不得继续承接 service 级业务编排。',
	},
	{
		pattern: /from ['"]@\/repositories(?:\/|['"])/,
		reason: '旧过渡目录已冻结，不得继续承接 repository 访问。',
	},
	{
		pattern: /from ['"]@\/infra(?:\/|['"])/,
		reason: '旧过渡目录已冻结，不得继续承接 infra 访问。',
	},
	{
		pattern: /from ['"]@\/adapters(?:\/|['"])/,
		reason: '旧过渡目录已冻结，不得继续承接 adapter 访问。',
	},
	{
		pattern: /from ['"]@tauri-apps\/api\/core['"]/,
		reason: '旧过渡目录已冻结，不得直接触达 Tauri command bridge。',
	},
]

function collectSourceFiles(directoryPath: string): string[] {
	if (!existsSync(directoryPath)) {
		return []
	}

	if (!statSync(directoryPath).isDirectory()) {
		return []
	}

	const files: string[] = []

	for (const entry of readdirSync(directoryPath, { withFileTypes: true })) {
		const entryPath = join(directoryPath, entry.name)

		if (entry.isDirectory()) {
			files.push(...collectSourceFiles(entryPath))
			continue
		}

		if (!['.ts', '.tsx'].includes(extname(entry.name))) {
			continue
		}

		files.push(entryPath)
	}

	return files
}

function findViolations(filePaths: string[], rules: { pattern: RegExp; reason: string }[]): Violation[] {
	const violations: Violation[] = []

	for (const filePath of filePaths) {
		const content = readFileSync(filePath, 'utf8')

		for (const rule of rules) {
			if (!rule.pattern.test(content)) {
				continue
			}

			violations.push({
				file: relative(projectRoot, filePath),
				reason: rule.reason,
			})
		}
	}

	return violations
}

function printViolations(title: string, violations: Violation[]) {
	if (violations.length === 0) {
		return
	}

	console.error(title)

	for (const violation of violations) {
		console.error(`- ${violation.file}: ${violation.reason}`)
	}
}

const pageViolations = findViolations(collectSourceFiles(join(srcRoot, 'pages')), pageImportBanRules)
const legacyViolations = findViolations(
	[
		...collectSourceFiles(join(srcRoot, 'components', 'navigation')),
		...collectSourceFiles(join(srcRoot, 'components', 'workbench')),
		...collectSourceFiles(join(srcRoot, 'components', 'overlays')),
	],
	legacyDirImportBanRules,
)

printViolations('页面层架构边界违规：', pageViolations)
printViolations('旧过渡目录架构边界违规：', legacyViolations)

if (pageViolations.length > 0 || legacyViolations.length > 0) {
	process.exitCode = 1
} else {
	console.info('架构边界检查通过。')
}
