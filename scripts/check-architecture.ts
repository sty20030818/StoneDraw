import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join, relative } from 'node:path'

type Violation = {
	file: string
	reason: string
}

type ImportBanRule = {
	pattern: RegExp
	reason: string
}

const projectRoot = process.cwd()
const srcRoot = join(projectRoot, 'src')

const frozenLegacyFileAllowlist = new Set([
	'src/overlay/CommandPalette.tsx',
	'src/overlay/ExportDialog.tsx',
	'src/overlay/index.ts',
	'src/overlay/NewDocumentDialog.tsx',
	'src/pages/index.ts',
	'src/pages/not-found/NotFoundPage.test.tsx',
	'src/pages/not-found/NotFoundPage.tsx',
	'src/repositories/documents/version.repository.test.ts',
	'src/repositories/index.ts',
	'src/repositories/settings/settings.repository.ts',
	'src/repositories/system/database.repository.ts',
	'src/repositories/system/directory.repository.ts',
	'src/services/database.service.ts',
	'src/services/directory.service.ts',
	'src/services/index.ts',
	'src/services/settings.service.ts',
	'src/services/tauri.service.test.ts',
	'src/stores/app.store.test.ts',
	'src/stores/app.store.ts',
	'src/stores/index.ts',
	'src/stores/overlay.store.ts',
	'src/stores/workbench.store.test.ts',
	'src/stores/workbench.store.ts',
	'src/stores/workspace.store.test.ts',
	'src/stores/workspace.store.ts',
])

const frozenLegacyRoots = [
	join(srcRoot, 'overlay'),
	join(srcRoot, 'pages'),
	join(srcRoot, 'repositories'),
	join(srcRoot, 'services'),
	join(srcRoot, 'stores'),
	join(srcRoot, 'workbench'),
]

const deletedLegacyRoots = [
	join(srcRoot, 'components', 'feedback'),
	join(srcRoot, 'components', 'navigation'),
	join(srcRoot, 'components', 'overlays'),
	join(srcRoot, 'components', 'panels'),
	join(srcRoot, 'components', 'states'),
	join(srcRoot, 'components', 'ui'),
	join(srcRoot, 'components', 'workbench'),
	join(srcRoot, 'components', 'workspace'),
	join(srcRoot, 'constants'),
	join(srcRoot, 'domain'),
	join(srcRoot, 'hooks'),
	join(srcRoot, 'infra'),
	join(srcRoot, 'lib'),
	join(srcRoot, 'mocks'),
	join(srcRoot, 'modules'),
	join(srcRoot, 'pages', 'editor'),
	join(srcRoot, 'pages', 'home'),
	join(srcRoot, 'pages', 'settings'),
	join(srcRoot, 'types'),
	join(srcRoot, 'utils'),
]

const guardedImportRoots = [
	join(srcRoot, 'app'),
	join(srcRoot, 'features'),
	join(srcRoot, 'shared'),
	join(srcRoot, 'platform'),
]

const guardedImportRules: ImportBanRule[] = [
	{
		pattern: /from ['"]@\/components\/navigation(?:\/|['"])/,
		reason: '旧 navigation 目录已删除，主链路不得再回退到该入口。',
	},
	{
		pattern: /from ['"]@\/components\/feedback(?:\/|['"])/,
		reason: '旧 feedback 目录已删除，共享反馈组件必须走 shared/ui。',
	},
	{
		pattern: /from ['"]@\/components\/panels(?:\/|['"])/,
		reason: '旧 panels 目录已删除，工作台面板必须走 features/workbench。',
	},
	{
		pattern: /from ['"]@\/components\/states(?:\/|['"])/,
		reason: '旧 states 目录已删除，状态组件必须走 shared/ui。',
	},
	{
		pattern: /from ['"]@\/components\/ui(?:\/|['"])/,
		reason: '旧 ui 目录已删除，共享基础组件必须走 shared/ui。',
	},
	{
		pattern: /from ['"]@\/components\/workbench(?:\/|['"])/,
		reason: '旧 workbench 目录已删除，主链路只能依赖 features/workbench。',
	},
	{
		pattern: /from ['"]@\/components\/overlays(?:\/|['"])/,
		reason: '旧 overlays 目录已删除，弹层必须使用 overlay 或 feature 公开入口。',
	},
	{
		pattern: /from ['"]@\/components\/workspace(?:\/|['"])/,
		reason: '旧 workspace 目录已删除，工作区组件必须走 features/workspace。',
	},
	{
		pattern: /from ['"]@\/pages\/editor(?:\/|['"])/,
		reason: '旧 pages/editor 入口已删除，不得重新引入编辑器旧页面。',
	},
	{
		pattern: /from ['"]@\/pages\/home(?:\/|['"])/,
		reason: '旧 pages/home 入口已删除，首页页面必须走新的路由编排。',
	},
	{
		pattern: /from ['"]@\/pages\/settings(?:\/|['"])/,
		reason: '旧 pages/settings 入口已删除，设置页必须走 features/settings。',
	},
	{
		pattern: /from ['"]@\/pages\/workspace\/WorkspacePage['"]/,
		reason: '旧 WorkspacePage 入口已删除，工作区首页编排不得回退。',
	},
	{
		pattern: /from ['"]@\/domain(?:\/|['"])/,
		reason: '旧 domain 目录已删除，共享类型必须走 shared/types。',
	},
	{
		pattern: /from ['"]@\/modules(?:\/|['"])/,
		reason: '旧 modules 目录已删除，业务实现必须收口到 features。',
	},
	{
		pattern: /from ['"]@\/infra(?:\/|['"])/,
		reason: '旧 infra 目录已删除，平台能力必须走 platform。',
	},
	{
		pattern: /from ['"]@\/constants(?:\/|['"])/,
		reason: '旧 constants 目录已删除，共享常量必须走 shared/constants。',
	},
	{
		pattern: /from ['"]@\/hooks(?:\/|['"])/,
		reason: '旧 hooks 目录已删除，共享 hooks 必须走 shared/hooks 或 feature 内部。',
	},
	{
		pattern: /from ['"]@\/lib(?:\/|['"])/,
		reason: '旧 lib 目录已删除，共享工具必须走 shared/lib。',
	},
	{
		pattern: /from ['"]@\/types(?:\/|['"])/,
		reason: '旧 types 目录已删除，共享类型必须走 shared/types。',
	},
	{
		pattern: /from ['"]@\/utils(?:\/|['"])/,
		reason: '旧 utils 目录已删除，共享工具必须走 shared/lib。',
	},
	{
		pattern: /local-storage\.service/,
		reason: 'local-storage.service 已删除，不得重新引入低价值占位服务。',
	},
	{
		pattern: /system\.service/,
		reason: 'system.service 已删除，不得重新引入低价值系统壳服务。',
	},
]

function normalizePath(filePath: string) {
	return relative(projectRoot, filePath).replaceAll('\\', '/')
}

function collectSourceFiles(directoryPath: string): string[] {
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

		if (!['.ts', '.tsx'].includes(extname(entry.name))) {
			continue
		}

		files.push(entryPath)
	}

	return files
}

function collectViolationsForDeletedRoots(): Violation[] {
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

function collectViolationsForFrozenRoots(): Violation[] {
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

function collectViolationsForGuardedImports(): Violation[] {
	const violations: Violation[] = []

	for (const root of guardedImportRoots) {
		for (const filePath of collectSourceFiles(root)) {
			const content = readFileSync(filePath, 'utf8')

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

function printViolations(title: string, violations: Violation[]) {
	if (violations.length === 0) {
		return
	}

	console.error(title)

	for (const violation of violations) {
		console.error(`- ${violation.file}: ${violation.reason}`)
	}
}

const deletedRootViolations = collectViolationsForDeletedRoots()
const frozenRootViolations = collectViolationsForFrozenRoots()
const guardedImportViolations = collectViolationsForGuardedImports()

printViolations('已删除 legacy 目录违规：', deletedRootViolations)
printViolations('legacy 冻结白名单违规：', frozenRootViolations)
printViolations('新架构导入边界违规：', guardedImportViolations)

if (deletedRootViolations.length > 0 || frozenRootViolations.length > 0 || guardedImportViolations.length > 0) {
	process.exitCode = 1
} else {
	console.info('架构边界检查通过。')
}
