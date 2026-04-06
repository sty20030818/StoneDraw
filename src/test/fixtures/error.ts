import type { AppError } from '@/types'

type CreateAppErrorInput = Partial<AppError> & Pick<AppError, 'code' | 'message'>

export function createAppError(input: CreateAppErrorInput): AppError {
	return {
		code: input.code,
		message: input.message,
		layer: input.layer ?? 'service',
		module: input.module ?? 'test-fixture',
		operation: input.operation ?? 'createAppError',
		correlationId: input.correlationId ?? 'test-correlation-id',
		details: input.details,
		command: input.command,
		objectId: input.objectId,
	}
}
