import { TAURI_COMMANDS } from '@/constants'
import type { DocumentMeta, TauriCommandResult } from '@/types'
import { createId, sanitizeFileName, toIsoString } from '@/utils'
import { createSuccessResult, invokeTauriCommand } from './tauri.service'

function createDocumentMeta(title = '未命名文档'): DocumentMeta {
	const timestamp = toIsoString()
	const id = createId('doc')

	return {
		id,
		title,
		fileName: `${sanitizeFileName(title)}.excalidraw`,
		createdAt: timestamp,
		updatedAt: timestamp,
		lastOpenedAt: null,
	}
}

export const documentService = {
	createDraft(title?: string): TauriCommandResult<DocumentMeta> {
		return createSuccessResult(createDocumentMeta(title))
	},
	async list(): Promise<TauriCommandResult<DocumentMeta[]>> {
		return invokeTauriCommand<DocumentMeta[]>(TAURI_COMMANDS.DOCUMENTS_LIST)
	},
	async open(documentId: string): Promise<TauriCommandResult<DocumentMeta>> {
		return invokeTauriCommand<DocumentMeta>(TAURI_COMMANDS.DOCUMENTS_OPEN, {
			documentId,
		})
	},
}
