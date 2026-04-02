import { create } from 'zustand'
import { SAVE_STATUSES } from '@/constants'
import type { SaveStatus } from '@/types'

type EditorStoreState = {
	activeDocumentId: string | null
	isEditorReady: boolean
	saveStatus: SaveStatus
	lastSceneUpdatedAt: number | null
	lastSceneElementCount: number
	lastSaveError: string | null
	hasScheduledSave: boolean
	hasPendingCompensationSave: boolean
	isFlushing: boolean
	setActiveDocumentId: (documentId: string | null) => void
	setEditorReady: (isReady: boolean) => void
	setSaveStatus: (saveStatus: SaveStatus) => void
	setLastSceneUpdatedAt: (timestamp: number | null) => void
	setLastSceneElementCount: (count: number) => void
	setLastSaveError: (error: string | null) => void
	setHasScheduledSave: (hasScheduledSave: boolean) => void
	setHasPendingCompensationSave: (hasPendingCompensationSave: boolean) => void
	setIsFlushing: (isFlushing: boolean) => void
	reset: () => void
}

const initialEditorState = {
	activeDocumentId: null,
	isEditorReady: false,
	saveStatus: SAVE_STATUSES.IDLE,
	lastSceneUpdatedAt: null,
	lastSceneElementCount: 0,
	lastSaveError: null,
	hasScheduledSave: false,
	hasPendingCompensationSave: false,
	isFlushing: false,
} satisfies Pick<
	EditorStoreState,
	| 'activeDocumentId'
	| 'isEditorReady'
	| 'saveStatus'
	| 'lastSceneUpdatedAt'
	| 'lastSceneElementCount'
	| 'lastSaveError'
	| 'hasScheduledSave'
	| 'hasPendingCompensationSave'
	| 'isFlushing'
>

// 编辑器 store 仅保存运行态，真实编辑器调用统一放到 service 或 adapter 层。
export const useEditorStore = create<EditorStoreState>((set) => ({
	...initialEditorState,
	setActiveDocumentId: (activeDocumentId) => set({ activeDocumentId }),
	setEditorReady: (isEditorReady) => set({ isEditorReady }),
	setSaveStatus: (saveStatus) => set({ saveStatus }),
	setLastSceneUpdatedAt: (lastSceneUpdatedAt) => set({ lastSceneUpdatedAt }),
	setLastSceneElementCount: (lastSceneElementCount) => set({ lastSceneElementCount }),
	setLastSaveError: (lastSaveError) => set({ lastSaveError }),
	setHasScheduledSave: (hasScheduledSave) => set({ hasScheduledSave }),
	setHasPendingCompensationSave: (hasPendingCompensationSave) => set({ hasPendingCompensationSave }),
	setIsFlushing: (isFlushing) => set({ isFlushing }),
	reset: () => set(initialEditorState),
}))
