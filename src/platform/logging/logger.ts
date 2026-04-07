import { invoke } from '@tauri-apps/api/core'
import { toIsoString } from '@/shared/lib/date'
import type { AppError, AppLayer, LogEvent, LogLevel } from '@/shared/types'

const LOG_COMMANDS = {
	WRITE_EVENT: 'logs_write_event',
} as const

type CreateLogEventInput = {
	level: LogLevel
	layer: AppLayer
	module: string
	operation: string
	correlationId: string
	message: string
	objectId?: string
	command?: string
	details?: string
	error?: AppError
	context?: Record<string, unknown>
}

function createLogEvent(input: CreateLogEventInput): LogEvent {
	return {
		...input,
		timestamp: toIsoString(),
	}
}

function shouldPersistLogEvent() {
	if (import.meta.env.MODE === 'test' || typeof window === 'undefined') {
		return false
	}

	const runtimeWindow = window as Window & {
		__TAURI__?: unknown
		__TAURI_INTERNALS__?: unknown
	}

	return Boolean(runtimeWindow.__TAURI__ || runtimeWindow.__TAURI_INTERNALS__)
}

async function persistLogEvent(event: LogEvent) {
	if (!shouldPersistLogEvent()) {
		return
	}

	try {
		await invoke(LOG_COMMANDS.WRITE_EVENT, {
			event,
		})
	} catch (error) {
		console.warn('[StoneDraw][logger.persist] 结构化日志落盘失败。', error)
	}
}

function writeConsole(event: LogEvent) {
	const prefix = `[StoneDraw][${event.layer}][${event.module}.${event.operation}][${event.correlationId}]`
	const payload = {
		objectId: event.objectId,
		command: event.command,
		details: event.details,
		context: event.context,
		error: event.error,
		timestamp: event.timestamp,
	}

	if (event.level === 'error') {
		console.error(prefix, event.message, payload)
		void persistLogEvent(event)
		return
	}

	if (event.level === 'warn') {
		console.warn(prefix, event.message, payload)
		void persistLogEvent(event)
		return
	}

	console.info(prefix, event.message, payload)
	void persistLogEvent(event)
}

export const logger = {
	info(input: Omit<CreateLogEventInput, 'level'>) {
		writeConsole(createLogEvent({ level: 'info', ...input }))
	},
	warn(input: Omit<CreateLogEventInput, 'level'>) {
		writeConsole(createLogEvent({ level: 'warn', ...input }))
	},
	error(input: Omit<CreateLogEventInput, 'level'>) {
		writeConsole(createLogEvent({ level: 'error', ...input }))
	},
}
