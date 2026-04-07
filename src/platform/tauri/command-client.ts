import { invoke } from '@tauri-apps/api/core'
import { useAppStore } from '@/app/state'
import { createId } from '@/shared/lib/id'
import type { AppError, AppErrorCode, AppLayer, CommandSuccessPayload, TauriCommandResult } from '@/shared/types'
import { logger } from '@/platform/logging'

type InvokeCommandOptions = {
	layer?: AppLayer
	module: string
	operation: string
	objectId?: string
	correlationId?: string
}

function createCommandError(
	command: string,
	code: AppErrorCode,
	message: string,
	options: InvokeCommandOptions,
	details?: string,
): AppError {
	return {
		code,
		message,
		details,
		command,
		layer: options.layer ?? 'infra',
		module: options.module,
		operation: options.operation,
		correlationId: options.correlationId ?? createId('corr'),
		objectId: options.objectId,
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

function isAppErrorPayload(value: unknown): value is Partial<AppError> & Pick<AppError, 'code' | 'message'> {
	if (!value || typeof value !== 'object') {
		return false
	}

	const candidate = value as Record<string, unknown>
	return typeof candidate.code === 'string' && typeof candidate.message === 'string'
}

function normalizeInvokeError(command: string, error: unknown, options: InvokeCommandOptions): AppError {
	if (isAppErrorPayload(error)) {
		return {
			code: error.code,
			message: error.message,
			details: error.details,
			command,
			layer: error.layer ?? options.layer ?? 'infra',
			module: error.module ?? options.module,
			operation: error.operation ?? options.operation,
			correlationId: error.correlationId ?? options.correlationId ?? createId('corr'),
			objectId: error.objectId ?? options.objectId,
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
					layer: parsed.layer ?? options.layer ?? 'infra',
					module: parsed.module ?? options.module,
					operation: parsed.operation ?? options.operation,
					correlationId: parsed.correlationId ?? options.correlationId ?? createId('corr'),
					objectId: parsed.objectId ?? options.objectId,
				}
			}
		} catch {
			return createCommandError(command, 'UNKNOWN_ERROR', error, options)
		}
	}

	return createCommandError(
		command,
		'UNKNOWN_ERROR',
		`命令 ${command} 调用失败`,
		options,
		'未能解析 Tauri 返回的错误对象。',
	)
}

export async function invokeTauriCommand<TData>(
	command: string,
	payload: Record<string, unknown> | undefined,
	options: InvokeCommandOptions,
): Promise<TauriCommandResult<TData>> {
	const correlationId = options.correlationId ?? createId('corr')
	const normalizedOptions = {
		...options,
		correlationId,
	}

	try {
		const response = await invoke<CommandSuccessPayload<TData>>(command, payload)
		const result = createSuccessResult(response.data)

		useAppStore.getState().reportCommandSuccess(command)
		logger.info({
			layer: normalizedOptions.layer ?? 'infra',
			module: normalizedOptions.module,
			operation: normalizedOptions.operation,
			correlationId,
			objectId: normalizedOptions.objectId,
			command,
			message: '命令调用成功。',
		})

		return result
	} catch (error) {
		const normalizedError = normalizeInvokeError(command, error, normalizedOptions)

		useAppStore.getState().reportCommandError(command, normalizedError)
		logger.error({
			layer: normalizedError.layer,
			module: normalizedError.module,
			operation: normalizedError.operation,
			correlationId: normalizedError.correlationId,
			objectId: normalizedError.objectId,
			command,
			details: normalizedError.details,
			message: '命令调用失败。',
			error: normalizedError,
		})

		return createFailureResult(normalizedError)
	}
}
