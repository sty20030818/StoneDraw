export type AppErrorCode =
	| 'IO_ERROR'
	| 'DB_ERROR'
	| 'INVALID_ARGUMENT'
	| 'NOT_FOUND'
	| 'NOT_INITIALIZED'
	| 'UNIMPLEMENTED_COMMAND'
	| 'UNKNOWN_ERROR'

export type AppError = {
	code: AppErrorCode
	message: string
	details?: string
	command?: string
}

export type AppBootStage = 'bootstrapping' | 'ready'

export type CommandBridgeStatus = 'idle' | 'ready' | 'error'

export type LocalDirectoryStatus = 'idle' | 'ready' | 'error'

export type SaveStatus = 'idle' | 'dirty' | 'saving' | 'saved'
