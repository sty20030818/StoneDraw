import type { DocumentMeta } from '@/shared/types'

export function createDocumentMeta(overrides: Partial<DocumentMeta> = {}): DocumentMeta {
	return {
		id: 'doc-test-1',
		title: '测试文档',
		createdAt: 1,
		updatedAt: 1,
		lastOpenedAt: 1,
		isDeleted: false,
		deletedAt: null,
		sourceType: 'local',
		saveStatus: 'saved',
		...overrides,
	}
}
