import type { PropsWithChildren } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useWorkbenchStore } from '@/features/workbench/state'
import type { DocumentVersionMeta, SaveStatus, TauriCommandResult } from '@/shared/types'

type WorkbenchShellState = {
	activePanel: ReturnType<typeof useWorkbenchStore.getState>['activePanel']
	documentId: string | null
	documentTitle: string
	searchDraft: string
	isDocumentReady: boolean
	saveStatus: SaveStatus
	isFlushing: boolean
	onBack: () => void
	onSave: () => void
	onCreateVersion: () => Promise<TauriCommandResult<DocumentVersionMeta> | null>
	onExport: () => void
	onMore: () => void
	onSearchChange: (value: string) => void
}

export function WorkbenchShellProvider({ children }: PropsWithChildren) {
	return children
}

export function useWorkbenchShell() {
	const shellState = useWorkbenchStore(useShallow((state) => ({
		activePanel: state.activePanel,
		documentId: state.activeDocumentId,
		documentTitle: state.documentTitle,
		searchDraft: state.searchDraft,
		isDocumentReady: state.isWorkbenchReady,
		saveStatus: state.saveStatus,
		isFlushing: state.isFlushing,
		onBack: state.onBack,
		onSave: state.onSave,
		onCreateVersion: state.onCreateVersion,
		onExport: state.onExport,
		onMore: state.onMore,
		onSearchChange: state.onSearchChange,
	})))
	const setActivePanel = useWorkbenchStore((state) => state.setActivePanel)

	return {
		shellState,
		setActivePanel,
	}
}

export function useWorkbenchShellController() {
	const resetShellState = useWorkbenchStore((state) => state.reset)
	const setActiveDocumentId = useWorkbenchStore((state) => state.setActiveDocumentId)
	const setDocumentTitle = useWorkbenchStore((state) => state.setDocumentTitle)
	const setSearchDraft = useWorkbenchStore((state) => state.setSearchDraft)
	const setWorkbenchReady = useWorkbenchStore((state) => state.setWorkbenchReady)
	const setSaveStatus = useWorkbenchStore((state) => state.setSaveStatus)
	const setIsFlushing = useWorkbenchStore((state) => state.setIsFlushing)
	const setWorkbenchActions = useWorkbenchStore((state) => state.setWorkbenchActions)

	function patchShellState(patch: Partial<WorkbenchShellState>) {
		if (patch.documentId !== undefined) {
			setActiveDocumentId(patch.documentId)
		}

		if (patch.documentTitle !== undefined) {
			setDocumentTitle(patch.documentTitle)
		}

		if (patch.searchDraft !== undefined) {
			setSearchDraft(patch.searchDraft)
		}

		if (patch.isDocumentReady !== undefined) {
			setWorkbenchReady(patch.isDocumentReady)
		}

		if (patch.saveStatus !== undefined) {
			setSaveStatus(patch.saveStatus)
		}

		if (patch.isFlushing !== undefined) {
			setIsFlushing(patch.isFlushing)
		}

		setWorkbenchActions({
			onBack: patch.onBack,
			onSave: patch.onSave,
			onCreateVersion: patch.onCreateVersion,
			onExport: patch.onExport,
			onMore: patch.onMore,
			onSearchChange: patch.onSearchChange,
		})
	}

	return {
		patchShellState,
		resetShellState,
	}
}

export type { WorkbenchShellState }
