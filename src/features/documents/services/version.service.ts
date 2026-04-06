import type { DocumentVersionMeta, TauriCommandResult } from '@/shared/types'
import { versionRepository } from '../api'

export const versionService = {
	async createManualVersion(documentId: string): Promise<TauriCommandResult<DocumentVersionMeta>> {
		return versionRepository.createManual(documentId)
	},

	async listDocumentVersions(documentId: string): Promise<TauriCommandResult<DocumentVersionMeta[]>> {
		return versionRepository.listByDocument(documentId)
	},
}
