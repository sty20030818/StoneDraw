import { TAURI_COMMANDS } from '@/constants'
import type { DocumentMeta, TauriCommandResult } from '@/types'
import { createId, toTimestamp } from '@/utils'
import { createSuccessResult, invokeTauriCommand } from './tauri.service'

function createDraftScenePath(documentId: string): string {
	return `documents/${documentId}/current.scene.json`
}

function createDocumentMeta(title = '未命名文档'): DocumentMeta {
	const timestamp = toTimestamp()
	const id = createId('doc')

	return {
		id,
		title,
		currentScenePath: createDraftScenePath(id),
		createdAt: timestamp,
		updatedAt: timestamp,
		lastOpenedAt: null,
		isDeleted: false,
		deletedAt: null,
		sourceType: 'local',
		saveStatus: 'saved',
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
