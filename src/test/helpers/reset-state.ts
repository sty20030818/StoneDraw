import { useAppStore } from '../../stores/app.store'
import { useDocumentStore } from '../../stores/document.store'
import { useOverlayStore } from '../../stores/overlay.store'
import { useWorkbenchStore } from '../../stores/workbench.store'
import { useWorkspaceStore } from '../../stores/workspace.store'

export function resetTestState() {
	useAppStore.getState().reset()
	useDocumentStore.getState().reset()
	useWorkbenchStore.getState().reset()
	useOverlayStore.getState().reset()
	useWorkspaceStore.getState().reset()
}
