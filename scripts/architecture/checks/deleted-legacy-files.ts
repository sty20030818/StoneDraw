import { existsSync } from 'node:fs'
import { deletedLegacyFiles, type Violation } from '../config'
import { normalizePath } from '../collect'

export function collectViolationsForDeletedFiles(): Violation[] {
	return deletedLegacyFiles
		.filter((filePath) => existsSync(filePath))
		.map((filePath) => ({
			file: normalizePath(filePath),
			reason: '该旧文件已经删除，不允许重新回到仓库主链。',
		}))
}
