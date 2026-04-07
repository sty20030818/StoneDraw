import { useAppStore } from '../../app/state'
import { useDocumentStore } from '../../features/documents/state'
import { useOverlayStore } from '../../features/overlays/state'
import { useWorkbenchStore } from '../../features/workbench/state'

export function resetTestState() {
	useAppStore.getState().reset()
	useDocumentStore.getState().reset()
	useWorkbenchStore.getState().reset()
	useOverlayStore.getState().reset()
}
