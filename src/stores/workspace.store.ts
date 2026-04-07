import { create } from 'zustand'

type WorkspaceSection = 'home' | 'documents' | 'templates' | 'search' | 'archive' | 'team' | 'settings'

type WorkspaceStoreState = {
	activeSection: WorkspaceSection
	setActiveSection: (section: WorkspaceSection) => void
	reset: () => void
}

const initialWorkspaceState = {
	activeSection: 'home' as WorkspaceSection,
} satisfies Pick<WorkspaceStoreState, 'activeSection'>

// 工作区 store 只组织管理态页面选择，不再承载文档集合与选中文档。
export const useWorkspaceStore = create<WorkspaceStoreState>((set) => ({
	...initialWorkspaceState,
	setActiveSection: (activeSection) => set({ activeSection }),
	reset: () => set(initialWorkspaceState),
}))

export type { WorkspaceSection }
