import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from 'react'
import type { SaveStatus } from '@/types'
import type { WorkbenchActivityItem } from '@/app/router'

type WorkbenchPanelKey = WorkbenchActivityItem['key']

type WorkbenchShellState = {
	activePanel: WorkbenchPanelKey
	documentId: string | null
	documentTitle: string
	searchDraft: string
	isDocumentReady: boolean
	saveStatus: SaveStatus
	isFlushing: boolean
	onBack: () => void
	onSave: () => void
	onExport: () => void
	onMore: () => void
	onSearchChange: (value: string) => void
}

type WorkbenchShellContextValue = {
	shellState: WorkbenchShellState
	setActivePanel: (panel: WorkbenchPanelKey) => void
	patchShellState: (patch: Partial<WorkbenchShellState>) => void
	resetShellState: () => void
}

const noop = () => undefined

const initialShellState: WorkbenchShellState = {
	activePanel: 'explorer',
	documentId: null,
	documentTitle: '未选择文档',
	searchDraft: '',
	isDocumentReady: false,
	saveStatus: 'idle',
	isFlushing: false,
	onBack: noop,
	onSave: noop,
	onExport: noop,
	onMore: noop,
	onSearchChange: noop,
}

const WorkbenchShellContext = createContext<WorkbenchShellContextValue | null>(null)

export function WorkbenchShellProvider({ children }: PropsWithChildren) {
	const [shellState, setShellState] = useState<WorkbenchShellState>(initialShellState)

	const setActivePanel = useCallback((activePanel: WorkbenchPanelKey) => {
		setShellState((currentState) => ({
			...currentState,
			activePanel,
		}))
	}, [])

	const patchShellState = useCallback((patch: Partial<WorkbenchShellState>) => {
		setShellState((currentState) => ({
			...currentState,
			...patch,
		}))
	}, [])

	const resetShellState = useCallback(() => {
		setShellState(initialShellState)
	}, [])

	const value = useMemo(
		() => ({
			shellState,
			setActivePanel,
			patchShellState,
			resetShellState,
		}),
		[patchShellState, resetShellState, setActivePanel, shellState],
	)

	return <WorkbenchShellContext.Provider value={value}>{children}</WorkbenchShellContext.Provider>
}

function useWorkbenchShellContext() {
	const context = useContext(WorkbenchShellContext)

	if (!context) {
		throw new Error('useWorkbenchShellContext 必须在 WorkbenchShellProvider 内使用。')
	}

	return context
}

export function useWorkbenchShell() {
	return useWorkbenchShellContext()
}

export type { WorkbenchPanelKey, WorkbenchShellState }
