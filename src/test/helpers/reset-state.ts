import { useAppStore } from '../../app/state'
import { useDocumentStore } from '../../features/documents/state'
import { useOverlayStore } from '../../features/overlays/state'
import { useWorkbenchStore } from '../../features/workbench/state'
import { useWorkspaceStore } from '../../features/workspace/state'

export function resetTestState() {
	useAppStore.getState().reset()
	useDocumentStore.getState().reset()
	useWorkspaceStore.getState().reset()
	useWorkbenchStore.getState().reset()
	useOverlayStore.getState().reset()
}
