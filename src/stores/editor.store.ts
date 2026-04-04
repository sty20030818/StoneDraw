import { create } from 'zustand'
import { SAVE_STATUSES } from '@/constants'
import type { SaveStatus } from '@/types'

type EditorStoreState = {
	activeDocumentId: string | null
	isEditorReady: boolean
	saveStatus: SaveStatus
	lastSaveError: string | null
	isFlushing: boolean
	setActiveDocumentId: (documentId: string | null) => void
	setEditorReady: (isReady: boolean) => void
	setSaveStatus: (saveStatus: SaveStatus) => void
	setLastSaveError: (error: string | null) => void
	setIsFlushing: (isFlushing: boolean) => void
	reset: () => void
}

const initialEditorState = {
	activeDocumentId: null,
	isEditorReady: false,
	saveStatus: SAVE_STATUSES.IDLE,
	lastSaveError: null,
	isFlushing: false,
} satisfies Pick<
	EditorStoreState,
	'activeDocumentId' | 'isEditorReady' | 'saveStatus' | 'lastSaveError' | 'isFlushing'
>

// 编辑器 store 仅保存运行态，真实编辑器调用统一放到 service 或 adapter 层。
export const useEditorStore = create<EditorStoreState>((set) => ({
	...initialEditorState,
	setActiveDocumentId: (activeDocumentId) => set({ activeDocumentId }),
	setEditorReady: (isEditorReady) => set({ isEditorReady }),
	setSaveStatus: (saveStatus) => set({ saveStatus }),
	setLastSaveError: (lastSaveError) => set({ lastSaveError }),
	setIsFlushing: (isFlushing) => set({ isFlushing }),
	reset: () => set(initialEditorState),
}))
