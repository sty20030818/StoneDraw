import { create } from 'zustand'
import type { DocumentMeta } from '@/types'

type DocumentCollectionStatus = 'idle' | 'loading' | 'ready' | 'error'

type DocumentStoreState = {
	documents: DocumentMeta[]
	recentDocuments: DocumentMeta[]
	trashedDocuments: DocumentMeta[]
	collectionStatus: DocumentCollectionStatus
	collectionErrorMessage: string | null
	selectedDocumentId: string | null
	setDocuments: (documents: DocumentMeta[]) => void
	setRecentDocuments: (documents: DocumentMeta[]) => void
	setTrashedDocuments: (documents: DocumentMeta[]) => void
	setSelectedDocumentId: (documentId: string | null) => void
	startCollectionLoading: () => void
	completeCollectionLoading: (payload: {
		documents: DocumentMeta[]
		recentDocuments: DocumentMeta[]
		trashedDocuments: DocumentMeta[]
	}) => void
	failCollectionLoading: (message: string) => void
	reset: () => void
}

const initialDocumentState = {
	documents: [],
	recentDocuments: [],
	trashedDocuments: [],
	collectionStatus: 'idle' as DocumentCollectionStatus,
	collectionErrorMessage: null,
	selectedDocumentId: null,
} satisfies Pick<
	DocumentStoreState,
	| 'documents'
	| 'recentDocuments'
	| 'trashedDocuments'
	| 'collectionStatus'
	| 'collectionErrorMessage'
	| 'selectedDocumentId'
>

// 文档 store 统一承接文档集合与选中文档，不再把这些数据塞进 Workspace 或 Workbench UI store。
export const useDocumentStore = create<DocumentStoreState>((set) => ({
	...initialDocumentState,
	setDocuments: (documents) => set({ documents }),
	setRecentDocuments: (recentDocuments) => set({ recentDocuments }),
	setTrashedDocuments: (trashedDocuments) => set({ trashedDocuments }),
	setSelectedDocumentId: (selectedDocumentId) => set({ selectedDocumentId }),
	startCollectionLoading: () =>
		set({
			collectionStatus: 'loading',
			collectionErrorMessage: null,
		}),
	completeCollectionLoading: ({ documents, recentDocuments, trashedDocuments }) =>
		set({
			documents,
			recentDocuments,
			trashedDocuments,
			collectionStatus: 'ready',
			collectionErrorMessage: null,
		}),
	failCollectionLoading: (collectionErrorMessage) =>
		set({
			documents: [],
			recentDocuments: [],
			trashedDocuments: [],
			collectionStatus: 'error',
			collectionErrorMessage,
		}),
	reset: () => set(initialDocumentState),
}))
