import type { DocumentVersionMeta } from '@/shared/types'

export function createDocumentVersionMeta(overrides: Partial<DocumentVersionMeta> = {}): DocumentVersionMeta {
	return {
		id: 'ver-test-1',
		documentId: 'doc-test-1',
		versionNumber: 1,
		versionKind: 'manual',
		label: '手动版本 1',
		snapshotPath: 'documents/doc-test-1/versions/ver-test-1.scene.json',
		createdAt: 1,
		sourceUpdatedAt: 1,
		...overrides,
	}
}
