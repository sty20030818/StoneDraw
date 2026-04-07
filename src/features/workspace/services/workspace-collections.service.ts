import { createFailureResult, createSuccessResult } from '@/platform/tauri'
import type { TauriCommandResult, WorkspaceDocumentCollections } from '@/shared/types'
import { documentRepository } from '@/features/documents'

export const workspaceCollectionsService = {
	async loadCollections(): Promise<TauriCommandResult<WorkspaceDocumentCollections>> {
		// Workspace 的三组集合必须作为一个整体读取，避免各页面各自拼装造成状态撕裂。
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
	},
}
