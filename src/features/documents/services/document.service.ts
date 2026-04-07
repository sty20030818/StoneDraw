import { createFailureResult, createSuccessResult } from '@/platform/tauri'
import type { CreateDocumentSuccessPayload, DocumentMeta, OpenDocumentSuccessPayload, TauriCommandResult } from '@/shared/types'
import { documentRepository, sceneRepository } from '../api'

export const documentService = {
	async createBlankDocument(title = '未命名文档'): Promise<TauriCommandResult<CreateDocumentSuccessPayload>> {
		const createResult = await documentRepository.create(title)

		if (!createResult.ok) {
			return createResult as TauriCommandResult<CreateDocumentSuccessPayload>
		}

		return createSuccessResult({
			document: createResult.data,
		})
	},

	async getById(documentId: string): Promise<TauriCommandResult<DocumentMeta>> {
		return documentRepository.getById(documentId)
	},

	async openDocument(documentId: string): Promise<TauriCommandResult<OpenDocumentSuccessPayload>> {
		// 正式打开动作先命中生命周期命令，再装载 scene 与最新集合，避免 UI 读取旧状态。
		const openResult = await documentRepository.open(documentId)

		if (!openResult.ok) {
			return openResult as TauriCommandResult<OpenDocumentSuccessPayload>
		}

		const sceneResult = await sceneRepository.readCurrent(documentId)

		if (!sceneResult.ok) {
			return createFailureResult(sceneResult.error) as TauriCommandResult<OpenDocumentSuccessPayload>
		}

		return createSuccessResult({
			document: openResult.data,
			scene: sceneResult.data,
		})
	},

	async renameDocument(documentId: string, title: string): Promise<TauriCommandResult<CreateDocumentSuccessPayload>> {
		const renameResult = await documentRepository.rename(documentId, title)

		if (!renameResult.ok) {
			return renameResult as TauriCommandResult<CreateDocumentSuccessPayload>
		}

		return createSuccessResult({
			document: renameResult.data,
		})
	},

	async trashDocument(documentId: string): Promise<TauriCommandResult<CreateDocumentSuccessPayload>> {
		const trashResult = await documentRepository.moveToTrash(documentId)

		if (!trashResult.ok) {
			return trashResult as TauriCommandResult<CreateDocumentSuccessPayload>
		}

		return createSuccessResult({
			document: trashResult.data,
		})
	},

	async restoreDocument(documentId: string): Promise<TauriCommandResult<CreateDocumentSuccessPayload>> {
		const restoreResult = await documentRepository.restore(documentId)

		if (!restoreResult.ok) {
			return restoreResult as TauriCommandResult<CreateDocumentSuccessPayload>
		}

		return createSuccessResult({
			document: restoreResult.data,
		})
	},

	async permanentlyDeleteDocument(documentId: string): Promise<TauriCommandResult<void>> {
		return documentRepository.permanentlyDelete(documentId)
	},
}
