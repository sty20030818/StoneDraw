import type { AppError, AppLayer } from './app'

export type LogLevel = 'info' | 'warn' | 'error'

export type LogEvent = {
	level: LogLevel
	layer: AppLayer
	module: string
	operation: string
	correlationId: string
	message: string
	timestamp: string
	objectId?: string
	command?: string
	details?: string
	error?: AppError
	context?: Record<string, unknown>
}
