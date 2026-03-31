import { create } from 'zustand'
import type { DocumentMeta } from '@/types'

type WorkspaceView = 'home' | 'documents'
type WorkspaceDocumentsStatus = 'idle' | 'loading' | 'ready' | 'error'

type WorkspaceStoreState = {
	currentView: WorkspaceView
	documents: DocumentMeta[]
	recentDocuments: DocumentMeta[]
	trashedDocuments: DocumentMeta[]
	documentsStatus: WorkspaceDocumentsStatus
	documentsErrorMessage: string | null
	selectedDocumentId: string | null
	setCurrentView: (view: WorkspaceView) => void
	setDocuments: (documents: DocumentMeta[]) => void
	setRecentDocuments: (documents: DocumentMeta[]) => void
	setTrashedDocuments: (documents: DocumentMeta[]) => void
	setDocumentsStatus: (status: WorkspaceDocumentsStatus) => void
	setDocumentsErrorMessage: (message: string | null) => void
	startDocumentsLoading: () => void
	completeDocumentsLoading: (payload: {
		documents: DocumentMeta[]
		recentDocuments: DocumentMeta[]
		trashedDocuments: DocumentMeta[]
	}) => void
	failDocumentsLoading: (message: string) => void
	setSelectedDocumentId: (documentId: string | null) => void
	reset: () => void
}

const initialWorkspaceState = {
	currentView: 'home' as WorkspaceView,
	documents: [],
	recentDocuments: [],
	trashedDocuments: [],
	documentsStatus: 'idle' as WorkspaceDocumentsStatus,
	documentsErrorMessage: null,
	selectedDocumentId: null,
} satisfies Pick<
	WorkspaceStoreState,
	| 'currentView'
	| 'documents'
	| 'recentDocuments'
	| 'trashedDocuments'
	| 'documentsStatus'
	| 'documentsErrorMessage'
	| 'selectedDocumentId'
>

// 工作区 store 只组织界面状态，不直接调用 service 或桌面能力。
export const useWorkspaceStore = create<WorkspaceStoreState>((set) => ({
	...initialWorkspaceState,
	setCurrentView: (currentView) => set({ currentView }),
	setDocuments: (documents) => set({ documents }),
	setRecentDocuments: (recentDocuments) => set({ recentDocuments }),
	setTrashedDocuments: (trashedDocuments) => set({ trashedDocuments }),
	setDocumentsStatus: (documentsStatus) => set({ documentsStatus }),
	setDocumentsErrorMessage: (documentsErrorMessage) => set({ documentsErrorMessage }),
	startDocumentsLoading: () =>
		set({
			documentsStatus: 'loading',
			documentsErrorMessage: null,
		}),
	completeDocumentsLoading: ({ documents, recentDocuments, trashedDocuments }) =>
		set({
			documents,
			recentDocuments,
			trashedDocuments,
			documentsStatus: 'ready',
			documentsErrorMessage: null,
		}),
	failDocumentsLoading: (documentsErrorMessage) =>
		set({
			documents: [],
			recentDocuments: [],
			trashedDocuments: [],
			documentsStatus: 'error',
			documentsErrorMessage,
		}),
	setSelectedDocumentId: (selectedDocumentId) => set({ selectedDocumentId }),
	reset: () => set(initialWorkspaceState),
}))
