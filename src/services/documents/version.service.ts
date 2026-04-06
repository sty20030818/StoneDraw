import { versionRepository } from '@/repositories'
import type { DocumentVersionMeta, TauriCommandResult } from '@/types'

export const versionService = {
	async createManualVersion(documentId: string): Promise<TauriCommandResult<DocumentVersionMeta>> {
		return versionRepository.createManual(documentId)
	},

	async listDocumentVersions(documentId: string): Promise<TauriCommandResult<DocumentVersionMeta[]>> {
		return versionRepository.listByDocument(documentId)
	},
}
