import { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { registerBeforeWindowHideHandler } from '@/app/shell/window-close-coordinator'
import { documentPersistenceSession } from '@/features/workbench/services'
import { APP_ROUTES } from '@/shared/constants/routes'
import type { SaveStatus } from '@/shared/types'
import type { WorkbenchLoadState } from '../workbench-page.types'

type UseWorkbenchLeaveGuardOptions = {
	handleManualSave: () => Promise<boolean>
	saveStatus: SaveStatus
	workbenchLoadState: WorkbenchLoadState
}

export function useWorkbenchLeaveGuard({
	handleManualSave,
	saveStatus,
	workbenchLoadState,
}: UseWorkbenchLeaveGuardOptions) {
	const navigate = useNavigate()

	const tryFlushBeforeLeaving = useCallback(
		async (options?: { timeoutMs?: number }) => {
			if (
				workbenchLoadState.status !== 'ready' ||
				(saveStatus !== 'dirty' && saveStatus !== 'saving' && saveStatus !== 'error')
			) {
				return true
			}

			const isFlushed = await documentPersistenceSession.flushBeforeLeave(workbenchLoadState.document, options)

			if (!isFlushed && options?.timeoutMs === undefined) {
				toast('自动保存未完成', {
					description: '系统已继续离开当前页面，最近修改可能未保存。',
				})
			}

			return isFlushed
		},
		[saveStatus, workbenchLoadState],
	)

	const navigateToWorkspace = useCallback(async () => {
		await tryFlushBeforeLeaving()
		navigate(APP_ROUTES.WORKSPACE_HOME)
	}, [navigate, tryFlushBeforeLeaving])

	useEffect(() => {
		if (workbenchLoadState.status !== 'ready') {
			return
		}

		return registerBeforeWindowHideHandler(async () => {
			if (saveStatus === 'saved' || saveStatus === 'idle') {
				return
			}

			await tryFlushBeforeLeaving({
				timeoutMs: 2000,
			})
		})
	}, [saveStatus, tryFlushBeforeLeaving, workbenchLoadState.status])

	useEffect(() => {
		if (workbenchLoadState.status !== 'ready') {
			return
		}

		function handleKeyDown(event: KeyboardEvent) {
			const isSaveShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's'

			if (!isSaveShortcut) {
				return
			}

			event.preventDefault()
			void handleManualSave()
		}

		window.addEventListener('keydown', handleKeyDown)

		return () => {
			window.removeEventListener('keydown', handleKeyDown)
		}
	}, [handleManualSave, workbenchLoadState.status])

	return {
		navigateToWorkspace,
	}
}
