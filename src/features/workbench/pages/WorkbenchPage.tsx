import { useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FileSearchIcon } from 'lucide-react'
import EmptyState from '@/shared/components/EmptyState'
import { useOverlayStore } from '@/features/overlays'
import { ExcalidrawHost } from '@/features/workbench/editor'
import { useWorkbenchStore } from '@/features/workbench/state'
import { CanvasShell, useWorkbenchShellController } from '@/features/workbench/ui'
import { useWorkbenchDocumentLifecycle } from './hooks/useWorkbenchDocumentLifecycle'
import { useWorkbenchLeaveGuard } from './hooks/useWorkbenchLeaveGuard'
import { useWorkbenchPersistenceActions } from './hooks/useWorkbenchPersistenceActions'
import { useWorkbenchSaveFeedback } from './hooks/useWorkbenchSaveFeedback'

const CANVAS_CARD_CLASS =
	'flex h-full min-h-0 flex-1 overflow-hidden rounded-[1.75rem] border border-border/70 bg-background/82 shadow-sm backdrop-blur'

function WorkbenchLoadingCanvas() {
	return (
		<div className={CANVAS_CARD_CLASS}>
			<div className='flex h-full min-h-0 w-full p-4 md:p-5'>
				<div className='h-full w-full rounded-lg border border-border/50 bg-white/95' />
			</div>
		</div>
	)
}

function WorkbenchPage() {
	const [searchParams] = useSearchParams()
	const documentId = searchParams.get('documentId')
	const { patchShellActions, resetShellActions } = useWorkbenchShellController()
	const openOverlay = useOverlayStore((state) => state.openOverlay)
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

	const handleExportOverlay = useCallback(() => {
		openOverlay('export', {
			documentId,
			documentTitle: workbenchLoadState.status === 'ready' ? workbenchLoadState.document.title : undefined,
			source: 'workbench-titlebar',
		})
	}, [documentId, openOverlay, workbenchLoadState])

	const handleShareOverlay = useCallback(() => {
		openOverlay('share', {
			documentId,
			documentTitle: workbenchLoadState.status === 'ready' ? workbenchLoadState.document.title : undefined,
			source: 'workbench-titlebar',
		})
	}, [documentId, openOverlay, workbenchLoadState])

	useEffect(() => {
		patchShellActions({
			onBack: () => {
				void navigateToWorkspace()
			},
			onSave: () => {
				void handleManualSave()
			},
			onCreateVersion: handleCreateVersion,
			onExport: handleExportOverlay,
			onMore: handleShareOverlay,
		})
	}, [
		handleExportOverlay,
		handleCreateVersion,
		handleManualSave,
		handleShareOverlay,
		navigateToWorkspace,
		patchShellActions,
	])

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
		<CanvasShell className={CANVAS_CARD_CLASS}>
			<ExcalidrawHost
				scene={workbenchLoadState.scene}
				onContentChange={handleContentChange}
				onReadyChange={setWorkbenchReady}
			/>
		</CanvasShell>
	)
}

export default WorkbenchPage
