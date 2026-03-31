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

	async listRecent(): Promise<TauriCommandResult<DocumentMeta[]>> {
		return invokeTauriCommand<DocumentMeta[]>(TAURI_COMMANDS.DOCUMENTS_LIST_RECENT)
	},

	async listTrashed(): Promise<TauriCommandResult<DocumentMeta[]>> {
		return invokeTauriCommand<DocumentMeta[]>(TAURI_COMMANDS.DOCUMENTS_LIST_TRASHED)
	},

	async open(documentId: string): Promise<TauriCommandResult<DocumentMeta>> {
		return invokeTauriCommand<DocumentMeta>(TAURI_COMMANDS.DOCUMENTS_OPEN, {
			documentId,
		})
	},

	async rename(documentId: string, title: string): Promise<TauriCommandResult<DocumentMeta>> {
		return invokeTauriCommand<DocumentMeta>(TAURI_COMMANDS.DOCUMENTS_RENAME, {
			documentId,
			title,
		})
	},

	async moveToTrash(documentId: string): Promise<TauriCommandResult<DocumentMeta>> {
		return invokeTauriCommand<DocumentMeta>(TAURI_COMMANDS.DOCUMENTS_MOVE_TO_TRASH, {
			documentId,
		})
	},

	async restore(documentId: string): Promise<TauriCommandResult<DocumentMeta>> {
		return invokeTauriCommand<DocumentMeta>(TAURI_COMMANDS.DOCUMENTS_RESTORE, {
			documentId,
		})
	},
}
