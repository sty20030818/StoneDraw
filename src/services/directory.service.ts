import { directoryRepository } from '@/repositories'
import type { DocumentPathLayout, LocalDirectoriesPayload, TauriCommandResult } from '@/types'

export const directoryService = {
	async prepareLocalDirectories(): Promise<TauriCommandResult<LocalDirectoriesPayload>> {
		return directoryRepository.prepareLocalDirectories()
	},

	async readLocalDirectories(): Promise<TauriCommandResult<LocalDirectoriesPayload>> {
		return directoryRepository.readLocalDirectories()
	},

	async resolveDataDirectory(): Promise<TauriCommandResult<string>> {
		return directoryRepository.resolveDataDirectory()
	},

	async resolveConfigDirectory(): Promise<TauriCommandResult<string>> {
		return directoryRepository.resolveConfigDirectory()
	},

	async resolveDocumentLayout(documentId: string): Promise<TauriCommandResult<DocumentPathLayout>> {
		return directoryRepository.resolveDocumentLayout(documentId)
	},
}
