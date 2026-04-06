import { create } from 'zustand'

type OverlayKey = 'command-palette' | 'new-document' | 'export' | 'recovery' | 'share'

type OverlayContext = {
	documentId?: string | null
	documentTitle?: string
	source?: string
}

type OverlayStoreState = {
	activeOverlay: OverlayKey | null
	context: OverlayContext | null
	openOverlay: (overlay: OverlayKey, context?: OverlayContext) => void
	closeOverlay: () => void
	reset: () => void
}

const initialOverlayState = {
	activeOverlay: null,
	context: null,
} satisfies Pick<OverlayStoreState, 'activeOverlay' | 'context'>

// Overlay store 统一管理应用级瞬时界面，避免页面各自维护命令面板、新建和导出入口。
export const useOverlayStore = create<OverlayStoreState>((set) => ({
	...initialOverlayState,
	openOverlay: (activeOverlay, context) =>
		set({
			activeOverlay,
			context: context ?? null,
		}),
	closeOverlay: () => set(initialOverlayState),
	reset: () => set(initialOverlayState),
}))

export type { OverlayContext, OverlayKey }
