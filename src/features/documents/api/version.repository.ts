import { TAURI_COMMANDS } from '@/shared/constants'
import { invokeTauriCommand } from '@/platform/tauri'
import type { DocumentVersionMeta, TauriCommandResult } from '@/shared/types'

export const versionRepository = {
	async createManual(documentId: string, correlationId?: string): Promise<TauriCommandResult<DocumentVersionMeta>> {
		return invokeTauriCommand<DocumentVersionMeta>(
			TAURI_COMMANDS.VERSIONS_CREATE,
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

	async listByDocument(
		documentId: string,
		correlationId?: string,
	): Promise<TauriCommandResult<DocumentVersionMeta[]>> {
		return invokeTauriCommand<DocumentVersionMeta[]>(
			TAURI_COMMANDS.VERSIONS_LIST,
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
