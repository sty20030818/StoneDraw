import type { AppError, TauriCommandResult } from '@/types'
import { logger } from '@/utils'

function createCommandError(command: string): AppError {
	return {
		code: 'TAURI_COMMAND_NOT_READY',
		message: `命令 ${command} 尚未接入`,
		details: 'Tauri command 桥接会在 0.1.3 版本补齐。',
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

// 当前版本先固定调用入口，后续再把 invoke 真正接到桌面层。
export async function invokeTauriCommand<TData>(
	command: string,
	payload?: Record<string, unknown>,
): Promise<TauriCommandResult<TData>> {
	logger.warn('tauri.service', '命令桥接尚未接入，返回占位错误。', {
		command,
		payload,
	})

	return createFailureResult(createCommandError(command))
}
