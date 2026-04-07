import { useAppStore } from '../../app/state'
import { useDocumentStore } from '../../features/documents'
import { useOverlayStore } from '../../features/overlays'
import { useWorkbenchStore } from '../../features/workbench'

export function resetTestState() {
	useAppStore.getState().reset()
	useDocumentStore.getState().reset()
	useWorkbenchStore.getState().reset()
	useOverlayStore.getState().reset()
}
