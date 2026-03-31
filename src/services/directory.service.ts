import { TAURI_COMMANDS } from '@/constants'
import type { DocumentPathLayout, LocalDirectoriesPayload, TauriCommandResult } from '@/types'
import { invokeTauriCommand } from './tauri.service'

export const directoryService = {
	async prepareLocalDirectories(): Promise<TauriCommandResult<LocalDirectoriesPayload>> {
		return invokeTauriCommand<LocalDirectoriesPayload>(TAURI_COMMANDS.FILES_PREPARE_LOCAL_DIRECTORIES)
	},

	async readLocalDirectories(): Promise<TauriCommandResult<LocalDirectoriesPayload>> {
		return invokeTauriCommand<LocalDirectoriesPayload>(TAURI_COMMANDS.FILES_READ_LOCAL_DIRECTORIES)
	},

	async resolveDataDirectory(): Promise<TauriCommandResult<string>> {
		return invokeTauriCommand<string>(TAURI_COMMANDS.FILES_RESOLVE_DATA_DIR)
	},

	async resolveConfigDirectory(): Promise<TauriCommandResult<string>> {
		return invokeTauriCommand<string>(TAURI_COMMANDS.FILES_RESOLVE_CONFIG_DIR)
	},

	async resolveDocumentLayout(documentId: string): Promise<TauriCommandResult<DocumentPathLayout>> {
		return invokeTauriCommand<DocumentPathLayout>(TAURI_COMMANDS.FILES_RESOLVE_DOCUMENT_LAYOUT, {
			documentId,
		})
	},
}
