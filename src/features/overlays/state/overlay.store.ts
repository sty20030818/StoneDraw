import { create } from 'zustand'

type OverlaySource =
	| 'workspace-topbar'
	| 'workspace-page'
	| 'home-page'
	| 'window-chrome'
	| 'archive-page'
	| 'workbench-side-panel'

type NewDocumentOverlay = {
	kind: 'new-document'
	source?: OverlaySource
	defaultTitle?: string
}

type ConfirmDialogOverlay = {
	kind: 'confirm-dialog'
	title: string
	description: string
	confirmLabel?: string
	cancelLabel?: string
	secondaryActionLabel?: string
	onConfirm?: () => void
	onSecondaryAction?: () => void
}

type OverlayState = NewDocumentOverlay | ConfirmDialogOverlay | null

type OverlayStoreState = {
	activeDialog: OverlayState
	openNewDocumentDialog: (payload?: Omit<NewDocumentOverlay, 'kind'>) => void
	openConfirmDialog: (payload: Omit<ConfirmDialogOverlay, 'kind'>) => void
	closeDialog: () => void
	reset: () => void
}

const initialOverlayState = {
	activeDialog: null,
} satisfies Pick<OverlayStoreState, 'activeDialog'>

// Overlay store 只保留正式主链还在使用的弹层能力，避免占位入口继续留在运行时。
export const useOverlayStore = create<OverlayStoreState>((set) => ({
	...initialOverlayState,
	openNewDocumentDialog: (payload) =>
		set({
			activeDialog: {
				kind: 'new-document',
				...payload,
			},
		}),
	openConfirmDialog: (payload) =>
		set({
			activeDialog: {
				kind: 'confirm-dialog',
				...payload,
			},
		}),
	closeDialog: () => set(initialOverlayState),
	reset: () => set(initialOverlayState),
}))

export type { ConfirmDialogOverlay, NewDocumentOverlay, OverlaySource, OverlayState }
