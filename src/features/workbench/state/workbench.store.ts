import { create } from 'zustand'
import { SAVE_STATUSES } from '@/shared/constants'
import type { SaveStatus } from '@/shared/types'

type WorkbenchPanelKey = 'explorer' | 'history'

type WorkbenchTab = {
	id: string
	title: string
}

type WorkbenchStoreState = {
	activeDocumentId: string | null
	documentTitle: string
	isWorkbenchReady: boolean
	saveStatus: SaveStatus
	lastSaveError: string | null
	isFlushing: boolean
	activePanel: WorkbenchPanelKey
	isSidePanelOpen: boolean
	isRightPanelOpen: boolean
	tabs: WorkbenchTab[]
	activeTabId: string | null
	setActiveDocumentId: (documentId: string | null) => void
	setDocumentTitle: (title: string) => void
	setWorkbenchReady: (isReady: boolean) => void
	setSaveStatus: (saveStatus: SaveStatus) => void
	setLastSaveError: (error: string | null) => void
	setIsFlushing: (isFlushing: boolean) => void
	setActivePanel: (panel: WorkbenchPanelKey) => void
	setSidePanelOpen: (isOpen: boolean) => void
	setRightPanelOpen: (isOpen: boolean) => void
	syncDocumentTab: (payload: { id: string; title: string }) => void
	activateDocumentTab: (documentId: string) => void
	closeDocumentTab: (documentId: string) => string | null
	reset: () => void
}

const initialWorkbenchState = {
	activeDocumentId: null,
	documentTitle: '未选择文档',
	isWorkbenchReady: false,
	saveStatus: SAVE_STATUSES.IDLE,
	lastSaveError: null,
	isFlushing: false,
	activePanel: 'explorer' as WorkbenchPanelKey,
	isSidePanelOpen: true,
	isRightPanelOpen: false,
	tabs: [],
	activeTabId: null,
} satisfies Pick<
	WorkbenchStoreState,
	| 'activeDocumentId'
	| 'documentTitle'
	| 'isWorkbenchReady'
	| 'saveStatus'
	| 'lastSaveError'
	| 'isFlushing'
	| 'activePanel'
	| 'isSidePanelOpen'
	| 'isRightPanelOpen'
	| 'tabs'
	| 'activeTabId'
>

// 工作台 store 只保留可序列化 UI 与会话状态，页面动作通过局部控制层提供。
export const useWorkbenchStore = create<WorkbenchStoreState>((set, get) => ({
	...initialWorkbenchState,
	setActiveDocumentId: (activeDocumentId) => set({ activeDocumentId }),
	setDocumentTitle: (documentTitle) => set({ documentTitle }),
	setWorkbenchReady: (isWorkbenchReady) => set({ isWorkbenchReady }),
	setSaveStatus: (saveStatus) => set({ saveStatus }),
	setLastSaveError: (lastSaveError) => set({ lastSaveError }),
	setIsFlushing: (isFlushing) => set({ isFlushing }),
	setActivePanel: (activePanel) => set({ activePanel }),
	setSidePanelOpen: (isSidePanelOpen) => set({ isSidePanelOpen }),
	setRightPanelOpen: (isRightPanelOpen) => set({ isRightPanelOpen }),
	syncDocumentTab: ({ id, title }) =>
		set((state) => {
			const hasCurrentTab = state.tabs.some((tab) => tab.id === id)
			const tabs = hasCurrentTab
				? state.tabs.map((tab) => (tab.id === id ? { ...tab, title } : tab))
				: [...state.tabs, { id, title }]

			return {
				tabs,
				activeDocumentId: id,
				activeTabId: id,
			}
		}),
	activateDocumentTab: (documentId) =>
		set((state) => {
			if (!state.tabs.some((tab) => tab.id === documentId)) {
				return {
					activeDocumentId: documentId,
				}
			}

			return {
				activeDocumentId: documentId,
				activeTabId: documentId,
			}
		}),
	closeDocumentTab: (documentId) => {
		const { tabs, activeTabId } = get()
		const tabIndex = tabs.findIndex((tab) => tab.id === documentId)

		if (tabIndex === -1) {
			return activeTabId
		}

		const nextTabs = tabs.filter((tab) => tab.id !== documentId)
		const fallbackTab = nextTabs[Math.max(0, tabIndex - 1)] ?? nextTabs[tabIndex] ?? null
		const nextActiveDocumentId = activeTabId === documentId ? (fallbackTab?.id ?? null) : activeTabId

		set({
			tabs: nextTabs,
			activeTabId: nextActiveDocumentId,
			activeDocumentId: nextActiveDocumentId,
		})

		return nextActiveDocumentId
	},
	reset: () => set(initialWorkbenchState),
}))

export type { WorkbenchPanelKey, WorkbenchTab }
