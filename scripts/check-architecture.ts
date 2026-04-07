import { collectViolationsForDeletedFiles } from './architecture/checks/deleted-legacy-files'
import { collectViolationsForBrokenModuleReferences } from './architecture/checks/broken-module-references'
import { collectViolationsForDeletedRoots } from './architecture/checks/deleted-legacy-roots'
import { collectViolationsForEmptyPlaceholderModules } from './architecture/checks/empty-placeholder-modules'
import { collectViolationsForFrozenRoots } from './architecture/checks/frozen-legacy-roots'
import { collectViolationsForGuardedImports } from './architecture/checks/guarded-imports'
import { collectViolationsForOrphanWrappers } from './architecture/checks/orphan-wrappers'
import { collectViolationsForRepositoryTruthSources } from './architecture/checks/repository-truth-sources'
import { printViolations } from './architecture/report'

const deletedFileViolations = collectViolationsForDeletedFiles()
const deletedRootViolations = collectViolationsForDeletedRoots()
const frozenRootViolations = collectViolationsForFrozenRoots()
const guardedImportViolations = collectViolationsForGuardedImports()
const brokenReferenceViolations = collectViolationsForBrokenModuleReferences()
const emptyPlaceholderViolations = collectViolationsForEmptyPlaceholderModules()
const orphanWrapperViolations = collectViolationsForOrphanWrappers()
const repositoryTruthSourceViolations = collectViolationsForRepositoryTruthSources()

printViolations('已删除 legacy 文件违规：', deletedFileViolations)
printViolations('已删除 legacy 目录违规：', deletedRootViolations)
printViolations('legacy 冻结白名单违规：', frozenRootViolations)
printViolations('新架构导入边界违规：', guardedImportViolations)
printViolations('相对路径导入或导出失效：', brokenReferenceViolations)
printViolations('空壳占位模块违规：', emptyPlaceholderViolations)
printViolations('legacy wrapper 违规：', orphanWrapperViolations)
printViolations('仓库真相源路径违规：', repositoryTruthSourceViolations)

if (
	deletedFileViolations.length > 0 ||
	deletedRootViolations.length > 0 ||
	frozenRootViolations.length > 0 ||
	guardedImportViolations.length > 0 ||
	brokenReferenceViolations.length > 0 ||
	emptyPlaceholderViolations.length > 0 ||
	orphanWrapperViolations.length > 0 ||
	repositoryTruthSourceViolations.length > 0
) {
	process.exitCode = 1
} else {
	console.info('架构边界检查通过。')
}
