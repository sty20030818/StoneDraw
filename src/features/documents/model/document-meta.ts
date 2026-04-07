import { createSuccessResult } from '@/platform/tauri'
import type { DocumentMeta, TauriCommandResult } from '@/shared/types'

type RawDocumentMeta = DocumentMeta & {
	currentScenePath?: string
}

function normalizeDocumentMeta(document: RawDocumentMeta): DocumentMeta {
	const { currentScenePath: _currentScenePath, ...documentMeta } = document

	return documentMeta
}

export function normalizeDocumentMetaResult(
	result: TauriCommandResult<RawDocumentMeta>,
): TauriCommandResult<DocumentMeta> {
	if (!result.ok) {
		return result as TauriCommandResult<DocumentMeta>
	}

	return createSuccessResult(normalizeDocumentMeta(result.data))
}

export function normalizeDocumentMetaListResult(
	result: TauriCommandResult<RawDocumentMeta[]>,
): TauriCommandResult<DocumentMeta[]> {
	if (!result.ok) {
		return result as TauriCommandResult<DocumentMeta[]>
	}

	return createSuccessResult(result.data.map(normalizeDocumentMeta))
}

export type { RawDocumentMeta }
