import { invokeTauriCommand } from '@/platform/tauri'
import type { DocumentVersionMeta, TauriCommandResult } from '@/shared/types'
import { DOCUMENT_TAURI_COMMANDS } from './commands'

export const versionRepository = {
	async createManual(documentId: string, correlationId?: string): Promise<TauriCommandResult<DocumentVersionMeta>> {
		return invokeTauriCommand<DocumentVersionMeta>(
			DOCUMENT_TAURI_COMMANDS.CREATE_VERSION,
			{
				documentId,
			},
			{
				module: 'version-repository',
				operation: 'createManual',
				layer: 'repository',
				objectId: documentId,
				correlationId,
			},
		)
	},

	async listByDocument(documentId: string, correlationId?: string): Promise<TauriCommandResult<DocumentVersionMeta[]>> {
		return invokeTauriCommand<DocumentVersionMeta[]>(
			DOCUMENT_TAURI_COMMANDS.LIST_VERSIONS,
			{
				documentId,
			},
			{
				module: 'version-repository',
				operation: 'listByDocument',
				layer: 'repository',
				objectId: documentId,
				correlationId,
			},
		)
	},
}
