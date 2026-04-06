import { create } from 'zustand'
import { SAVE_STATUSES } from '@/constants'
import type { SaveStatus } from '@/types'

type WorkbenchPanelKey = 'explorer' | 'search' | 'library' | 'history' | 'team'

type WorkbenchTab = {
	id: string
	title: string
}

type WorkbenchStoreState = {
	activeDocumentId: string | null
	documentTitle: string
	searchDraft: string
	isWorkbenchReady: boolean
	saveStatus: SaveStatus
	lastSaveError: string | null
	isFlushing: boolean
	activePanel: WorkbenchPanelKey
	isSidePanelOpen: boolean
	isRightPanelOpen: boolean
	tabs: WorkbenchTab[]
	activeTabId: string | null
	onBack: () => void
	onSave: () => void
	onExport: () => void
	onMore: () => void
	onSearchChange: (value: string) => void
	setActiveDocumentId: (documentId: string | null) => void
	setDocumentTitle: (title: string) => void
	setSearchDraft: (value: string) => void
	setWorkbenchReady: (isReady: boolean) => void
	setSaveStatus: (saveStatus: SaveStatus) => void
	setLastSaveError: (error: string | null) => void
	setIsFlushing: (isFlushing: boolean) => void
	setActivePanel: (panel: WorkbenchPanelKey) => void
	setSidePanelOpen: (isOpen: boolean) => void
	setRightPanelOpen: (isOpen: boolean) => void
	setWorkbenchActions: (payload: {
		onBack?: () => void
		onSave?: () => void
		onExport?: () => void
		onMore?: () => void
		onSearchChange?: (value: string) => void
	}) => void
	syncDocumentTab: (payload: { id: string; title: string }) => void
	activateDocumentTab: (documentId: string) => void
	closeDocumentTab: (documentId: string) => string | null
	reset: () => void
}

const noop = () => undefined

const initialWorkbenchState = {
	activeDocumentId: null,
	documentTitle: '未选择文档',
	searchDraft: '',
	isWorkbenchReady: false,
	saveStatus: SAVE_STATUSES.IDLE,
	lastSaveError: null,
	isFlushing: false,
	activePanel: 'explorer' as WorkbenchPanelKey,
	isSidePanelOpen: true,
	isRightPanelOpen: true,
	tabs: [],
	activeTabId: null,
	onBack: noop,
	onSave: noop,
	onExport: noop,
	onMore: noop,
	onSearchChange: noop,
} satisfies Pick<
	WorkbenchStoreState,
	| 'activeDocumentId'
	| 'documentTitle'
	| 'searchDraft'
	| 'isWorkbenchReady'
	| 'saveStatus'
	| 'lastSaveError'
	| 'isFlushing'
	| 'activePanel'
	| 'isSidePanelOpen'
	| 'isRightPanelOpen'
	| 'tabs'
	| 'activeTabId'
	| 'onBack'
	| 'onSave'
	| 'onExport'
	| 'onMore'
	| 'onSearchChange'
>

// 工作台 store 统一承接创作态 UI、保存态和标题栏动作，不再分散在 editor store 与组件局部状态里。
export const useWorkbenchStore = create<WorkbenchStoreState>((set, get) => ({
	...initialWorkbenchState,
	setActiveDocumentId: (activeDocumentId) => set({ activeDocumentId }),
	setDocumentTitle: (documentTitle) => set({ documentTitle }),
	setSearchDraft: (searchDraft) => set({ searchDraft }),
	setWorkbenchReady: (isWorkbenchReady) => set({ isWorkbenchReady }),
	setSaveStatus: (saveStatus) => set({ saveStatus }),
	setLastSaveError: (lastSaveError) => set({ lastSaveError }),
	setIsFlushing: (isFlushing) => set({ isFlushing }),
	setActivePanel: (activePanel) => set({ activePanel }),
	setSidePanelOpen: (isSidePanelOpen) => set({ isSidePanelOpen }),
	setRightPanelOpen: (isRightPanelOpen) => set({ isRightPanelOpen }),
	setWorkbenchActions: (payload) =>
		set((state) => ({
			onBack: payload.onBack ?? state.onBack,
			onSave: payload.onSave ?? state.onSave,
			onExport: payload.onExport ?? state.onExport,
			onMore: payload.onMore ?? state.onMore,
			onSearchChange: payload.onSearchChange ?? state.onSearchChange,
		})),
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
		const nextActiveDocumentId = activeTabId === documentId ? fallbackTab?.id ?? null : activeTabId

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
