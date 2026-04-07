import { useCallback, type Dispatch, type SetStateAction } from 'react'
import { toast } from 'sonner'
import { versionService } from '@/features/documents'
import { type EditorContentChangePayload } from '@/features/workbench/editor'
import { documentPersistenceSession } from '@/features/workbench/services'
import type { DocumentVersionMeta, TauriCommandResult } from '@/shared/types'
import type { WorkbenchLoadState } from '../workbench-page.types'

type UseWorkbenchPersistenceActionsOptions = {
	workbenchLoadState: WorkbenchLoadState
	setWorkbenchLoadState: Dispatch<SetStateAction<WorkbenchLoadState>>
}

export function useWorkbenchPersistenceActions({
	workbenchLoadState,
	setWorkbenchLoadState,
}: UseWorkbenchPersistenceActionsOptions) {
	const persistCurrentDocument = useCallback(async () => {
		if (workbenchLoadState.status !== 'ready') {
			return null
		}

		const saveResult = await documentPersistenceSession.saveNow(workbenchLoadState.document)

		if (!saveResult.ok) {
			toast('保存失败', {
				description: saveResult.error.details ?? saveResult.error.message,
			})
			return null
		}

		setWorkbenchLoadState({
			status: 'ready',
			document: saveResult.data.document,
			scene: saveResult.data.scene,
		})

		return saveResult.data
	}, [setWorkbenchLoadState, workbenchLoadState])

	const handleManualSave = useCallback(async () => {
		const persistResult = await persistCurrentDocument()

		return persistResult !== null
	}, [persistCurrentDocument])

	const handleCreateVersion = useCallback(async (): Promise<TauriCommandResult<DocumentVersionMeta> | null> => {
		if (workbenchLoadState.status !== 'ready') {
			return null
		}

		const persistResult = await persistCurrentDocument()

		if (!persistResult) {
			return null
		}

		return versionService.createManualVersion(persistResult.document.id)
	}, [persistCurrentDocument, workbenchLoadState.status])

	const handleContentChange = useCallback(
		(payload: EditorContentChangePayload) => {
			if (workbenchLoadState.status !== 'ready') {
				return
			}

			documentPersistenceSession.onSceneChange(
				workbenchLoadState.document,
				payload.elements,
				payload.appState,
				payload.files,
			)
		},
		[workbenchLoadState],
	)

	return {
		handleContentChange,
		handleCreateVersion,
		handleManualSave,
	}
}
