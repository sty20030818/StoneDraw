import type { AppError } from './app'

export type CommandSuccessPayload<TData> = {
	data: TData
}

export type TauriCommandSuccess<TData> = {
	ok: true
	data: TData
}

export type TauriCommandFailure = {
	ok: false
	error: AppError
}

export type TauriCommandResult<TData> = TauriCommandSuccess<TData> | TauriCommandFailure
