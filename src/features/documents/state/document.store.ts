import { create } from 'zustand'

type DocumentStoreState = {
	selectedDocumentId: string | null
	setSelectedDocumentId: (documentId: string | null) => void
	reset: () => void
}

const initialDocumentState = {
	selectedDocumentId: null,
} satisfies Pick<DocumentStoreState, 'selectedDocumentId'>

// 文档 store 只保留文档域选择态，工作区读模型改由 workspace feature 自己管理。
export const useDocumentStore = create<DocumentStoreState>((set) => ({
	...initialDocumentState,
	setSelectedDocumentId: (selectedDocumentId) => set({ selectedDocumentId }),
	reset: () => set(initialDocumentState),
}))
