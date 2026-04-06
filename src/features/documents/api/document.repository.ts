import { TAURI_COMMANDS } from '@/shared/constants'
import { invokeTauriCommand } from '@/platform/tauri'
import type { DocumentMeta, TauriCommandResult } from '@/shared/types'

export const documentRepository = {
	async create(title?: string, correlationId?: string): Promise<TauriCommandResult<DocumentMeta>> {
		return invokeTauriCommand<DocumentMeta>(
			TAURI_COMMANDS.DOCUMENTS_CREATE,
			{
				title,
			},
			{
				module: 'document-repository',
				operation: 'create',
				layer: 'repository',
				correlationId,
			},
		)
	},

	async getById(documentId: string, correlationId?: string): Promise<TauriCommandResult<DocumentMeta>> {
		return invokeTauriCommand<DocumentMeta>(
			TAURI_COMMANDS.DOCUMENTS_GET_BY_ID,
			{
				documentId,
			},
			{
				module: 'document-repository',
				operation: 'getById',
				layer: 'repository',
				objectId: documentId,
				correlationId,
			},
		)
	},

	async list(correlationId?: string): Promise<TauriCommandResult<DocumentMeta[]>> {
		return invokeTauriCommand<DocumentMeta[]>(TAURI_COMMANDS.DOCUMENTS_LIST, undefined, {
			module: 'document-repository',
			operation: 'list',
			layer: 'repository',
			correlationId,
		})
	},

	async listRecent(correlationId?: string): Promise<TauriCommandResult<DocumentMeta[]>> {
		return invokeTauriCommand<DocumentMeta[]>(TAURI_COMMANDS.DOCUMENTS_LIST_RECENT, undefined, {
			module: 'document-repository',
			operation: 'listRecent',
			layer: 'repository',
			correlationId,
		})
	},

	async listTrashed(correlationId?: string): Promise<TauriCommandResult<DocumentMeta[]>> {
		return invokeTauriCommand<DocumentMeta[]>(TAURI_COMMANDS.DOCUMENTS_LIST_TRASHED, undefined, {
			module: 'document-repository',
			operation: 'listTrashed',
			layer: 'repository',
			correlationId,
		})
	},

	async open(documentId: string, correlationId?: string): Promise<TauriCommandResult<DocumentMeta>> {
		return invokeTauriCommand<DocumentMeta>(
			TAURI_COMMANDS.DOCUMENTS_OPEN,
			{
				documentId,
			},
			{
				module: 'document-repository',
				operation: 'openDocument',
				layer: 'repository',
				objectId: documentId,
				correlationId,
			},
		)
	},

	async rename(documentId: string, title: string, correlationId?: string): Promise<TauriCommandResult<DocumentMeta>> {
		return invokeTauriCommand<DocumentMeta>(
			TAURI_COMMANDS.DOCUMENTS_RENAME,
			{
				documentId,
				title,
			},
			{
				module: 'document-repository',
				operation: 'rename',
				layer: 'repository',
				objectId: documentId,
				correlationId,
			},
		)
	},

	async moveToTrash(documentId: string, correlationId?: string): Promise<TauriCommandResult<DocumentMeta>> {
		return invokeTauriCommand<DocumentMeta>(
			TAURI_COMMANDS.DOCUMENTS_MOVE_TO_TRASH,
			{
				documentId,
			},
			{
				module: 'document-repository',
				operation: 'moveToTrash',
				layer: 'repository',
				objectId: documentId,
				correlationId,
			},
		)
	},

	async restore(documentId: string, correlationId?: string): Promise<TauriCommandResult<DocumentMeta>> {
		return invokeTauriCommand<DocumentMeta>(
			TAURI_COMMANDS.DOCUMENTS_RESTORE,
			{
				documentId,
			},
			{
				module: 'document-repository',
				operation: 'restore',
				layer: 'repository',
				objectId: documentId,
				correlationId,
			},
		)
	},

	async permanentlyDelete(documentId: string, correlationId?: string): Promise<TauriCommandResult<void>> {
		return invokeTauriCommand<void>(
			TAURI_COMMANDS.DOCUMENTS_PERMANENTLY_DELETE,
			{
				documentId,
			},
			{
				module: 'document-repository',
				operation: 'permanentlyDelete',
				layer: 'repository',
				objectId: documentId,
				correlationId,
			},
		)
	},
}
