import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FileSearchIcon } from 'lucide-react'
import EmptyState from '@/shared/components/EmptyState'
import { ExcalidrawHost } from '@/features/workbench/editor'
import { useWorkbenchStore } from '@/features/workbench/state'
import { CanvasShell, useWorkbenchShellController } from '@/features/workbench/ui'
import { useWorkbenchDocumentLifecycle } from './hooks/useWorkbenchDocumentLifecycle'
import { useWorkbenchLeaveGuard } from './hooks/useWorkbenchLeaveGuard'
import { useWorkbenchPersistenceActions } from './hooks/useWorkbenchPersistenceActions'
import { useWorkbenchSaveFeedback } from './hooks/useWorkbenchSaveFeedback'

const CANVAS_SURFACE_CLASS = 'flex h-full min-h-0 flex-1 overflow-hidden bg-background'

function WorkbenchLoadingCanvas() {
	return (
		<div className={CANVAS_SURFACE_CLASS}>
			<div className='h-full w-full bg-card/40' />
		</div>
	)
}

function WorkbenchPage() {
	const [searchParams] = useSearchParams()
	const documentId = searchParams.get('documentId')
	const { patchShellActions, resetShellActions } = useWorkbenchShellController()
	const saveStatus = useWorkbenchStore((state) => state.saveStatus)
	const lastSaveError = useWorkbenchStore((state) => state.lastSaveError)
	const setWorkbenchReady = useWorkbenchStore((state) => state.setWorkbenchReady)
	const { workbenchLoadState, setWorkbenchLoadState } = useWorkbenchDocumentLifecycle({
		documentId,
		resetShellActions,
	})
	const { handleContentChange, handleCreateVersion, handleManualSave } = useWorkbenchPersistenceActions({
		workbenchLoadState,
		setWorkbenchLoadState,
	})
	const { navigateToWorkspace } = useWorkbenchLeaveGuard({
		handleManualSave,
		saveStatus,
		workbenchLoadState,
	})

	useWorkbenchSaveFeedback(lastSaveError)

	useEffect(() => {
		patchShellActions({
			onBack: () => {
				void navigateToWorkspace()
			},
			onSave: () => {
				void handleManualSave()
			},
			onCreateVersion: handleCreateVersion,
		})
	}, [handleCreateVersion, handleManualSave, navigateToWorkspace, patchShellActions])

	if (workbenchLoadState.status === 'error') {
		return (
			<EmptyState
				title={workbenchLoadState.title}
				description={workbenchLoadState.description}
				icon={FileSearchIcon}
				actionLabel='返回工作区'
				onAction={() => {
					void navigateToWorkspace()
				}}
			/>
		)
	}

	if (workbenchLoadState.status !== 'ready') {
		return <WorkbenchLoadingCanvas />
	}

	return (
		<CanvasShell className={CANVAS_SURFACE_CLASS}>
			<ExcalidrawHost
				scene={workbenchLoadState.scene}
				onContentChange={handleContentChange}
				onReadyChange={setWorkbenchReady}
			/>
		</CanvasShell>
	)
}

export default WorkbenchPage
