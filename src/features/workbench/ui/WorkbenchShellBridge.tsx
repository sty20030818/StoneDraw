import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from 'react'
import type { DocumentVersionMeta, TauriCommandResult } from '@/shared/types'
import { useWorkbenchStore } from '@/features/workbench/state'

type WorkbenchShellState = {
	onBack: () => void
	onSave: () => void
	onCreateVersion: () => Promise<TauriCommandResult<DocumentVersionMeta> | null>
	onExport: () => void
	onMore: () => void
}

const noop = () => undefined
const asyncNoop = async () => null

const initialShellState: WorkbenchShellState = {
	onBack: noop,
	onSave: noop,
	onCreateVersion: asyncNoop,
	onExport: noop,
	onMore: noop,
}

const WorkbenchShellContext = createContext<{
	shellActions: WorkbenchShellState
	setShellActions: (patch: Partial<WorkbenchShellState>) => void
	resetShellActions: () => void
} | null>(null)

export function WorkbenchShellProvider({ children }: PropsWithChildren) {
	const [shellActions, setShellActionsState] = useState(initialShellState)
	const setShellActions = useCallback((patch: Partial<WorkbenchShellState>) => {
		setShellActionsState((currentState) => {
			const nextState = {
				...currentState,
				...patch,
			}

			if (
				currentState.onBack === nextState.onBack &&
				currentState.onSave === nextState.onSave &&
				currentState.onCreateVersion === nextState.onCreateVersion &&
				currentState.onExport === nextState.onExport &&
				currentState.onMore === nextState.onMore
			) {
				return currentState
			}

			return nextState
		})
	}, [])
	const resetShellActions = useCallback(() => {
		setShellActionsState((currentState) => (currentState === initialShellState ? currentState : initialShellState))
	}, [])

	const contextValue = useMemo(
		() => ({
			shellActions,
			setShellActions,
			resetShellActions,
		}),
		[resetShellActions, setShellActions, shellActions],
	)

	return <WorkbenchShellContext.Provider value={contextValue}>{children}</WorkbenchShellContext.Provider>
}

export function useWorkbenchShell() {
	const context = useContext(WorkbenchShellContext)

	if (!context) {
		throw new Error('useWorkbenchShell 必须在 WorkbenchShellProvider 内使用。')
	}

	const shellState = context.shellActions
	const setActivePanel = useWorkbenchStore((state) => state.setActivePanel)

	return {
		shellState,
		setActivePanel,
	}
}

export function useWorkbenchShellController() {
	const context = useContext(WorkbenchShellContext)

	if (!context) {
		throw new Error('useWorkbenchShellController 必须在 WorkbenchShellProvider 内使用。')
	}

	return {
		patchShellActions: context.setShellActions,
		resetShellActions: context.resetShellActions,
	}
}

export type { WorkbenchShellState }
