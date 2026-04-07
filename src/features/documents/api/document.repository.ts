import { invokeTauriCommand } from '@/platform/tauri'
import type { DocumentMeta, TauriCommandResult } from '@/shared/types'
import { normalizeDocumentMetaListResult, normalizeDocumentMetaResult, type RawDocumentMeta } from '../model'
import { DOCUMENT_TAURI_COMMANDS } from './commands'

export const documentRepository = {
	async create(title?: string, correlationId?: string): Promise<TauriCommandResult<DocumentMeta>> {
		const result = await invokeTauriCommand<RawDocumentMeta>(
			DOCUMENT_TAURI_COMMANDS.CREATE,
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

		return normalizeDocumentMetaResult(result)
	},

	async getById(documentId: string, correlationId?: string): Promise<TauriCommandResult<DocumentMeta>> {
		const result = await invokeTauriCommand<RawDocumentMeta>(
			DOCUMENT_TAURI_COMMANDS.GET_BY_ID,
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

		return normalizeDocumentMetaResult(result)
	},

	async list(correlationId?: string): Promise<TauriCommandResult<DocumentMeta[]>> {
		const result = await invokeTauriCommand<RawDocumentMeta[]>(DOCUMENT_TAURI_COMMANDS.LIST, undefined, {
			module: 'document-repository',
			operation: 'list',
			layer: 'repository',
			correlationId,
		})

		return normalizeDocumentMetaListResult(result)
	},

	async listRecent(correlationId?: string): Promise<TauriCommandResult<DocumentMeta[]>> {
		const result = await invokeTauriCommand<RawDocumentMeta[]>(DOCUMENT_TAURI_COMMANDS.LIST_RECENT, undefined, {
			module: 'document-repository',
			operation: 'listRecent',
			layer: 'repository',
			correlationId,
		})

		return normalizeDocumentMetaListResult(result)
	},

	async listTrashed(correlationId?: string): Promise<TauriCommandResult<DocumentMeta[]>> {
		const result = await invokeTauriCommand<RawDocumentMeta[]>(DOCUMENT_TAURI_COMMANDS.LIST_TRASHED, undefined, {
			module: 'document-repository',
			operation: 'listTrashed',
			layer: 'repository',
			correlationId,
		})

		return normalizeDocumentMetaListResult(result)
	},

	async open(documentId: string, correlationId?: string): Promise<TauriCommandResult<DocumentMeta>> {
		const result = await invokeTauriCommand<RawDocumentMeta>(
			DOCUMENT_TAURI_COMMANDS.OPEN,
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

		return normalizeDocumentMetaResult(result)
	},

	async rename(documentId: string, title: string, correlationId?: string): Promise<TauriCommandResult<DocumentMeta>> {
		const result = await invokeTauriCommand<RawDocumentMeta>(
			DOCUMENT_TAURI_COMMANDS.RENAME,
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

		return normalizeDocumentMetaResult(result)
	},

	async moveToTrash(documentId: string, correlationId?: string): Promise<TauriCommandResult<DocumentMeta>> {
		const result = await invokeTauriCommand<RawDocumentMeta>(
			DOCUMENT_TAURI_COMMANDS.MOVE_TO_TRASH,
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

		return normalizeDocumentMetaResult(result)
	},

	async restore(documentId: string, correlationId?: string): Promise<TauriCommandResult<DocumentMeta>> {
		const result = await invokeTauriCommand<RawDocumentMeta>(
			DOCUMENT_TAURI_COMMANDS.RESTORE,
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

		return normalizeDocumentMetaResult(result)
	},

	async permanentlyDelete(documentId: string, correlationId?: string): Promise<TauriCommandResult<void>> {
		return invokeTauriCommand<void>(
			DOCUMENT_TAURI_COMMANDS.PERMANENTLY_DELETE,
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
