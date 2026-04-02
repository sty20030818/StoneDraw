import { invoke } from '@tauri-apps/api/core'
import { useAppStore } from '@/stores/app.store'
import type { AppError, AppErrorCode, CommandSuccessPayload, TauriCommandResult } from '@/types/index'
import { logger } from '@/utils/logger'

function createCommandError(command: string, code: AppErrorCode, message: string, details?: string): AppError {
	return {
		code,
		message,
		details,
		command,
	}
}

export function createSuccessResult<TData>(data: TData): TauriCommandResult<TData> {
	return {
		ok: true,
		data,
	}
}

export function createFailureResult(error: AppError): TauriCommandResult<never> {
	return {
		ok: false,
		error,
	}
}

function isAppErrorPayload(value: unknown): value is AppError {
	if (!value || typeof value !== 'object') {
		return false
	}

	const candidate = value as Record<string, unknown>
	return typeof candidate.code === 'string' && typeof candidate.message === 'string'
}

function normalizeInvokeError(command: string, error: unknown): AppError {
	if (isAppErrorPayload(error)) {
		return {
			code: error.code,
			message: error.message,
			details: error.details,
			command,
		}
	}

	if (typeof error === 'string') {
		try {
			const parsed = JSON.parse(error) as unknown

			if (isAppErrorPayload(parsed)) {
				return {
					code: parsed.code,
					message: parsed.message,
					details: parsed.details,
					command,
				}
			}
		} catch {
			return createCommandError(command, 'UNKNOWN_ERROR', error)
		}
	}

	return createCommandError(command, 'UNKNOWN_ERROR', `命令 ${command} 调用失败`, '未能解析 Tauri 返回的错误对象。')
}

export async function invokeTauriCommand<TData>(
	command: string,
	payload?: Record<string, unknown>,
): Promise<TauriCommandResult<TData>> {
	try {
		const response = await invoke<CommandSuccessPayload<TData>>(command, payload)
		const result = createSuccessResult(response.data)

		useAppStore.getState().reportCommandSuccess(command)
		logger.info('tauri.service', '命令调用成功。', { command })

		return result
	} catch (error) {
		const normalizedError = normalizeInvokeError(command, error)

		useAppStore.getState().reportCommandError(command, normalizedError)
		logger.error('tauri.service', '命令调用失败。', {
			command,
			error: normalizedError,
		})

		return createFailureResult(normalizedError)
	}
}
