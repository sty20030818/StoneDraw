export type AppError = {
	code: string
	message: string
	details?: string
}

export type AppBootStage = 'bootstrapping' | 'ready'

export type SaveStatus = 'idle' | 'dirty' | 'saving' | 'saved'
