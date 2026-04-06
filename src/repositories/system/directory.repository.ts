import { TAURI_COMMANDS } from '@/constants'
import { invokeTauriCommand } from '@/infra/tauri'
import type { DocumentPathLayout, LocalDirectoriesPayload, TauriCommandResult } from '@/types'

export const directoryRepository = {
	async prepareLocalDirectories(correlationId?: string): Promise<TauriCommandResult<LocalDirectoriesPayload>> {
		return invokeTauriCommand<LocalDirectoriesPayload>(TAURI_COMMANDS.FILES_PREPARE_LOCAL_DIRECTORIES, undefined, {
			module: 'directory-repository',
			operation: 'prepareLocalDirectories',
			layer: 'repository',
			correlationId,
		})
	},

	async readLocalDirectories(correlationId?: string): Promise<TauriCommandResult<LocalDirectoriesPayload>> {
		return invokeTauriCommand<LocalDirectoriesPayload>(TAURI_COMMANDS.FILES_READ_LOCAL_DIRECTORIES, undefined, {
			module: 'directory-repository',
			operation: 'readLocalDirectories',
			layer: 'repository',
			correlationId,
		})
	},

	async resolveDataDirectory(correlationId?: string): Promise<TauriCommandResult<string>> {
		return invokeTauriCommand<string>(TAURI_COMMANDS.FILES_RESOLVE_DATA_DIR, undefined, {
			module: 'directory-repository',
			operation: 'resolveDataDirectory',
			layer: 'repository',
			correlationId,
		})
	},

	async resolveConfigDirectory(correlationId?: string): Promise<TauriCommandResult<string>> {
		return invokeTauriCommand<string>(TAURI_COMMANDS.FILES_RESOLVE_CONFIG_DIR, undefined, {
			module: 'directory-repository',
			operation: 'resolveConfigDirectory',
			layer: 'repository',
			correlationId,
		})
	},

	async resolveDocumentLayout(documentId: string, correlationId?: string): Promise<TauriCommandResult<DocumentPathLayout>> {
		return invokeTauriCommand<DocumentPathLayout>(
			TAURI_COMMANDS.FILES_RESOLVE_DOCUMENT_LAYOUT,
			{
				documentId,
			},
			{
				module: 'directory-repository',
				operation: 'resolveDocumentLayout',
				layer: 'repository',
				objectId: documentId,
				correlationId,
			},
		)
	},
}
