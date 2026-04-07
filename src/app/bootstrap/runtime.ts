import { logger } from '@/platform/logging'
import { databaseRepository, directoryRepository } from '@/platform/tauri'
import { createId, toIsoString } from '@/shared/lib'
import type { BootstrapHealthSnapshot, BootstrapRuntimeResult } from '@/shared/types'

const DATABASE_FILE_NAME = 'app.db'

function createSnapshot(correlationId: string): BootstrapHealthSnapshot {
	return {
		correlationId,
		startedAt: toIsoString(),
		finishedAt: toIsoString(),
		localDirectoriesStatus: 'error',
		databaseStatus: 'idle',
		databaseFileName: DATABASE_FILE_NAME,
		databasePath: null,
	}
}

export async function runBootstrapRuntime(): Promise<BootstrapRuntimeResult> {
	const correlationId = createId('boot')
	const snapshot = createSnapshot(correlationId)

	logger.info({
		layer: 'bootstrap',
		module: 'bootstrap-runtime',
		operation: 'run',
		correlationId,
		message: '开始执行应用启动引导。',
	})

	const localDirectoriesResult = await directoryRepository.prepareLocalDirectories(correlationId)
	snapshot.localDirectoriesStatus = localDirectoriesResult.ok ? 'ready' : 'error'

	if (!localDirectoriesResult.ok) {
		snapshot.finishedAt = toIsoString()
		logger.error({
			layer: 'bootstrap',
			module: 'bootstrap-runtime',
			operation: 'prepareLocalDirectories',
			correlationId,
			message: '本地目录初始化失败。',
			error: localDirectoriesResult.error,
		})

		return {
			ok: false,
			error: {
				error: localDirectoriesResult.error,
				snapshot,
				localDirectories: null,
				databaseHealth: null,
			},
		}
	}

	const databaseResult = await databaseRepository.initialize(correlationId)
	snapshot.databaseStatus = databaseResult.ok ? 'ready' : 'error'
	snapshot.finishedAt = toIsoString()
	snapshot.databasePath = databaseResult.ok ? databaseResult.data.databasePath : null

	if (!databaseResult.ok) {
		logger.error({
			layer: 'bootstrap',
			module: 'bootstrap-runtime',
			operation: 'initializeDatabase',
			correlationId,
			message: 'SQLite 初始化失败。',
			error: databaseResult.error,
		})

		return {
			ok: false,
			error: {
				error: databaseResult.error,
				snapshot,
				localDirectories: localDirectoriesResult.data,
				databaseHealth: null,
			},
		}
	}

	logger.info({
		layer: 'bootstrap',
		module: 'bootstrap-runtime',
		operation: 'run',
		correlationId,
		message: '应用启动引导完成。',
		context: {
			localDirectoriesStatus: snapshot.localDirectoriesStatus,
			databaseStatus: snapshot.databaseStatus,
			databaseFileName: snapshot.databaseFileName,
		},
	})

	return {
		ok: true,
		data: {
			localDirectories: localDirectoriesResult.data,
			databaseHealth: databaseResult.data,
			snapshot,
		},
	}
}
