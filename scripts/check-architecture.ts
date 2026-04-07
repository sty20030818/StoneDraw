import { collectViolationsForBrokenModuleReferences } from './architecture/checks/broken-module-references'
import { collectViolationsForDeletedRoots } from './architecture/checks/deleted-legacy-roots'
import { collectViolationsForEmptyPlaceholderModules } from './architecture/checks/empty-placeholder-modules'
import { collectViolationsForFrozenRoots } from './architecture/checks/frozen-legacy-roots'
import { collectViolationsForGuardedImports } from './architecture/checks/guarded-imports'
import { collectViolationsForOrphanWrappers } from './architecture/checks/orphan-wrappers'
import { printViolations } from './architecture/report'

const deletedRootViolations = collectViolationsForDeletedRoots()
const frozenRootViolations = collectViolationsForFrozenRoots()
const guardedImportViolations = collectViolationsForGuardedImports()
const brokenReferenceViolations = collectViolationsForBrokenModuleReferences()
const emptyPlaceholderViolations = collectViolationsForEmptyPlaceholderModules()
const orphanWrapperViolations = collectViolationsForOrphanWrappers()

printViolations('已删除 legacy 目录违规：', deletedRootViolations)
printViolations('legacy 冻结白名单违规：', frozenRootViolations)
printViolations('新架构导入边界违规：', guardedImportViolations)
printViolations('相对路径导入或导出失效：', brokenReferenceViolations)
printViolations('空壳占位模块违规：', emptyPlaceholderViolations)
printViolations('legacy wrapper 违规：', orphanWrapperViolations)

if (
	deletedRootViolations.length > 0 ||
	frozenRootViolations.length > 0 ||
	guardedImportViolations.length > 0 ||
	brokenReferenceViolations.length > 0 ||
	emptyPlaceholderViolations.length > 0 ||
	orphanWrapperViolations.length > 0
) {
	process.exitCode = 1
} else {
	console.info('架构边界检查通过。')
}
