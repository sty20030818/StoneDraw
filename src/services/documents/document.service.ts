import { documentRepository } from '@/repositories'
import type { DocumentMeta, TauriCommandResult } from '@/types/index'

export const documentService = {
	async create(title?: string): Promise<TauriCommandResult<DocumentMeta>> {
		return documentRepository.create(title)
	},

	async getById(documentId: string): Promise<TauriCommandResult<DocumentMeta>> {
		return documentRepository.getById(documentId)
	},

	async list(): Promise<TauriCommandResult<DocumentMeta[]>> {
		return documentRepository.list()
	},

	async listRecent(): Promise<TauriCommandResult<DocumentMeta[]>> {
		return documentRepository.listRecent()
	},

	async listTrashed(): Promise<TauriCommandResult<DocumentMeta[]>> {
		return documentRepository.listTrashed()
	},

	async open(documentId: string): Promise<TauriCommandResult<DocumentMeta>> {
		return documentRepository.open(documentId)
	},

	async rename(documentId: string, title: string): Promise<TauriCommandResult<DocumentMeta>> {
		return documentRepository.rename(documentId, title)
	},

	async moveToTrash(documentId: string): Promise<TauriCommandResult<DocumentMeta>> {
		return documentRepository.moveToTrash(documentId)
	},

	async restore(documentId: string): Promise<TauriCommandResult<DocumentMeta>> {
		return documentRepository.restore(documentId)
	},
}
