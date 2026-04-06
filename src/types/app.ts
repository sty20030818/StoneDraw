export type AppErrorCode =
	| 'IO_ERROR'
	| 'DB_ERROR'
	| 'INVALID_ARGUMENT'
	| 'NOT_FOUND'
	| 'NOT_INITIALIZED'
	| 'UNIMPLEMENTED_COMMAND'
	| 'UNKNOWN_ERROR'

export type AppLayer = 'ui' | 'bootstrap' | 'service' | 'repository' | 'infra' | 'native-command' | 'storage'

export type AppError = {
	code: AppErrorCode
	message: string
	layer: AppLayer
	module: string
	operation: string
	correlationId: string
	details?: string
	command?: string
	objectId?: string
}

export type AppBootStage = 'bootstrapping' | 'failed' | 'ready'

export type CommandBridgeStatus = 'idle' | 'ready' | 'error'

export type LocalDirectoryStatus = 'idle' | 'ready' | 'error'

export type DatabaseStatus = 'idle' | 'ready' | 'error'

export type SaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error'
