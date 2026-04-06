import { createFailureResult, createSuccessResult } from '@/platform/tauri'
import type {
	CreateDocumentSuccessPayload,
	DocumentMeta,
	OpenDocumentSuccessPayload,
	TauriCommandResult,
	WorkspaceDocumentCollections,
} from '@/shared/types'
import { documentRepository, sceneRepository } from '../api'

async function loadWorkspaceCollectionsInternal(): Promise<TauriCommandResult<WorkspaceDocumentCollections>> {
	// Workspace 的三组集合必须作为一个整体返回，避免页面各自拼装时出现状态撕裂。
	const [documentsResult, recentDocumentsResult, trashedDocumentsResult] = await Promise.all([
		documentRepository.list(),
		documentRepository.listRecent(),
		documentRepository.listTrashed(),
	])

	if (!documentsResult.ok) {
		return createFailureResult(documentsResult.error) as TauriCommandResult<WorkspaceDocumentCollections>
	}

	if (!recentDocumentsResult.ok) {
		return createFailureResult(recentDocumentsResult.error) as TauriCommandResult<WorkspaceDocumentCollections>
	}

	if (!trashedDocumentsResult.ok) {
		return createFailureResult(trashedDocumentsResult.error) as TauriCommandResult<WorkspaceDocumentCollections>
	}

	return createSuccessResult({
		documents: documentsResult.data,
		recentDocuments: recentDocumentsResult.data,
		trashedDocuments: trashedDocumentsResult.data,
	})
}

async function withCollections<TPayload, TOutput>(
	result: TauriCommandResult<TPayload>,
	mapper: (payload: TPayload, collections: WorkspaceDocumentCollections) => TOutput,
): Promise<TauriCommandResult<TOutput>> {
	if (!result.ok) {
		return result as TauriCommandResult<TOutput>
	}

	const collectionsResult = await loadWorkspaceCollectionsInternal()

	if (!collectionsResult.ok) {
		return createFailureResult(collectionsResult.error) as TauriCommandResult<TOutput>
	}

	return createSuccessResult(mapper(result.data, collectionsResult.data))
}

export const documentService = {
	async createBlankDocument(title = '未命名文档'): Promise<TauriCommandResult<CreateDocumentSuccessPayload>> {
		const createResult = await documentRepository.create(title)
		const result = await withCollections(createResult, (document, collections) => ({
			document,
			collections,
		}))

		return result
	},

	async getById(documentId: string): Promise<TauriCommandResult<DocumentMeta>> {
		return documentRepository.getById(documentId)
	},

	async loadWorkspaceCollections(): Promise<TauriCommandResult<WorkspaceDocumentCollections>> {
		return loadWorkspaceCollectionsInternal()
	},

	async openDocument(documentId: string): Promise<TauriCommandResult<OpenDocumentSuccessPayload>> {
		// 正式打开动作先命中生命周期命令，再装载 scene 与最新集合，避免 UI 读取旧状态。
		const openResult = await documentRepository.open(documentId)

		if (!openResult.ok) {
			return openResult as TauriCommandResult<OpenDocumentSuccessPayload>
		}

		const [sceneResult, collectionsResult] = await Promise.all([
			sceneRepository.readCurrent(documentId),
			loadWorkspaceCollectionsInternal(),
		])

		if (!sceneResult.ok) {
			return createFailureResult(sceneResult.error) as TauriCommandResult<OpenDocumentSuccessPayload>
		}

		if (!collectionsResult.ok) {
			return createFailureResult(collectionsResult.error) as TauriCommandResult<OpenDocumentSuccessPayload>
		}

		return createSuccessResult({
			document: openResult.data,
			scene: sceneResult.data,
			collections: collectionsResult.data,
		})
	},

	async renameDocument(documentId: string, title: string): Promise<TauriCommandResult<CreateDocumentSuccessPayload>> {
		const renameResult = await documentRepository.rename(documentId, title)
		const result = await withCollections(renameResult, (document, collections) => ({
			document,
			collections,
		}))

		return result
	},

	async trashDocument(documentId: string): Promise<TauriCommandResult<CreateDocumentSuccessPayload>> {
		const trashResult = await documentRepository.moveToTrash(documentId)
		const result = await withCollections(trashResult, (document, collections) => ({
			document,
			collections,
		}))

		return result
	},

	async restoreDocument(documentId: string): Promise<TauriCommandResult<CreateDocumentSuccessPayload>> {
		const restoreResult = await documentRepository.restore(documentId)
		const result = await withCollections(restoreResult, (document, collections) => ({
			document,
			collections,
		}))

		return result
	},

	async permanentlyDeleteDocument(documentId: string): Promise<TauriCommandResult<WorkspaceDocumentCollections>> {
		const deleteResult = await documentRepository.permanentlyDelete(documentId)

		if (!deleteResult.ok) {
			return deleteResult as TauriCommandResult<WorkspaceDocumentCollections>
		}

		return loadWorkspaceCollectionsInternal()
	},
}
