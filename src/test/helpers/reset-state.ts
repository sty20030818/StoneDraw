import { useAppStore } from '../../stores/app.store'
import { useDocumentStore } from '../../stores/document.store'
import { useOverlayStore } from '../../stores/overlay.store'
import { useWorkbenchStore } from '../../features/workbench/state'
import { useWorkspaceStore } from '../../stores/workspace.store'

export function resetTestState() {
	useAppStore.getState().reset()
	useDocumentStore.getState().reset()
	useWorkbenchStore.getState().reset()
	useOverlayStore.getState().reset()
	useWorkspaceStore.getState().reset()
}
