import type { AppError } from './app'
import type { DatabaseHealthPayload } from './database'
import type { LocalDirectoriesPayload } from './directory'

export type BootstrapHealthSnapshot = {
	correlationId: string
	startedAt: string
	finishedAt: string
	localDirectoriesStatus: 'ready' | 'error'
	databaseStatus: 'idle' | 'ready' | 'error'
	databaseFileName: string
	databasePath: string | null
}

export type BootstrapSuccessPayload = {
	localDirectories: LocalDirectoriesPayload
	databaseHealth: DatabaseHealthPayload
	snapshot: BootstrapHealthSnapshot
}

export type BootstrapFailurePayload = {
	error: AppError
	snapshot: BootstrapHealthSnapshot
	localDirectories: LocalDirectoriesPayload | null
	databaseHealth: DatabaseHealthPayload | null
}

export type BootstrapRuntimeResult =
	| {
			ok: true
			data: BootstrapSuccessPayload
	  }
	| {
			ok: false
			error: BootstrapFailurePayload
	  }
