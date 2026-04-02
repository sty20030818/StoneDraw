import { useAppStore } from '../../stores/app.store'
import { useEditorStore } from '../../stores/editor.store'
import { useWorkspaceStore } from '../../stores/workspace.store'

export function resetTestState() {
	useAppStore.getState().reset()
	useEditorStore.getState().reset()
	useWorkspaceStore.getState().reset()
}
