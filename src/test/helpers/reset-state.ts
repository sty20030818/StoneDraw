import { useAppStore } from '../../stores/app.store'
import { useDocumentStore } from '../../stores/document.store'
import { useEditorStore } from '../../stores/editor.store'
import { useOverlayStore } from '../../stores/overlay.store'
import { useWorkspaceStore } from '../../stores/workspace.store'

export function resetTestState() {
	useAppStore.getState().reset()
	useDocumentStore.getState().reset()
	useEditorStore.getState().reset()
	useOverlayStore.getState().reset()
	useWorkspaceStore.getState().reset()
}
