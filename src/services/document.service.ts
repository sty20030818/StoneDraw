import { TAURI_COMMANDS } from '@/constants'
import type { DocumentMeta, TauriCommandResult } from '@/types'
import { invokeTauriCommand } from './tauri.service'

export const documentService = {
	async create(title?: string): Promise<TauriCommandResult<DocumentMeta>> {
		return invokeTauriCommand<DocumentMeta>(TAURI_COMMANDS.DOCUMENTS_CREATE, {
			title,
		})
	},

	async getById(documentId: string): Promise<TauriCommandResult<DocumentMeta>> {
		return invokeTauriCommand<DocumentMeta>(TAURI_COMMANDS.DOCUMENTS_GET_BY_ID, {
			documentId,
		})
	},

	async list(): Promise<TauriCommandResult<DocumentMeta[]>> {
		return invokeTauriCommand<DocumentMeta[]>(TAURI_COMMANDS.DOCUMENTS_LIST)
	},

	async open(documentId: string): Promise<TauriCommandResult<DocumentMeta>> {
		return invokeTauriCommand<DocumentMeta>(TAURI_COMMANDS.DOCUMENTS_OPEN, {
			documentId,
		})
	},
}
