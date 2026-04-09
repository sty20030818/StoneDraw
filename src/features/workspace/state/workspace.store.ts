import { create } from 'zustand'
import type { DocumentMeta, WorkspaceDocumentCollections } from '@/shared/types'

type WorkspaceCollectionStatus = 'idle' | 'loading' | 'ready' | 'error'

type WorkspaceStoreState = {
	documents: DocumentMeta[]
	recentDocuments: DocumentMeta[]
	trashedDocuments: DocumentMeta[]
	collectionStatus: WorkspaceCollectionStatus
	collectionErrorMessage: string | null
	startCollectionLoading: () => void
	syncWorkspaceCollections: (payload: WorkspaceDocumentCollections) => void
	failCollectionLoading: (message: string) => void
	reset: () => void
}

const initialWorkspaceState = {
	documents: [],
	recentDocuments: [],
	trashedDocuments: [],
	collectionStatus: 'idle' as WorkspaceCollectionStatus,
	collectionErrorMessage: null,
} satisfies Pick<
	WorkspaceStoreState,
	'documents' | 'recentDocuments' | 'trashedDocuments' | 'collectionStatus' | 'collectionErrorMessage'
>

// Workspace store 只承接工作区读模型，不再把文档集合状态塞进 documents 领域状态。
export const useWorkspaceStore = create<WorkspaceStoreState>((set) => ({
	...initialWorkspaceState,
	startCollectionLoading: () =>
		set({
			collectionStatus: 'loading',
			collectionErrorMessage: null,
		}),
	syncWorkspaceCollections: ({ documents, recentDocuments, trashedDocuments }) =>
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
	reset: () => set(initialWorkspaceState),
}))
