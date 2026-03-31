import { create } from 'zustand'
import type { DocumentMeta } from '@/types'

type WorkspaceView = 'home' | 'documents'

type WorkspaceStoreState = {
	currentView: WorkspaceView
	documents: DocumentMeta[]
	selectedDocumentId: string | null
	setCurrentView: (view: WorkspaceView) => void
	setDocuments: (documents: DocumentMeta[]) => void
	setSelectedDocumentId: (documentId: string | null) => void
	reset: () => void
}

const initialWorkspaceState = {
	currentView: 'home' as WorkspaceView,
	documents: [],
	selectedDocumentId: null,
} satisfies Pick<WorkspaceStoreState, 'currentView' | 'documents' | 'selectedDocumentId'>

// 工作区 store 只组织界面状态，不直接调用 service 或桌面能力。
export const useWorkspaceStore = create<WorkspaceStoreState>((set) => ({
	...initialWorkspaceState,
	setCurrentView: (currentView) => set({ currentView }),
	setDocuments: (documents) => set({ documents }),
	setSelectedDocumentId: (selectedDocumentId) => set({ selectedDocumentId }),
	reset: () => set(initialWorkspaceState),
}))
