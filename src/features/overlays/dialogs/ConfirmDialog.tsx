import { CircleHelpIcon } from 'lucide-react'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogMedia,
	AlertDialogTitle,
} from '@/shared/ui/alert-dialog'
import { useOverlayStore } from '../state'

function ConfirmDialog() {
	const activeDialog = useOverlayStore((state) => state.activeDialog)
	const closeDialog = useOverlayStore((state) => state.closeDialog)
	const isOpen = activeDialog?.kind === 'confirm-dialog'

	function handleConfirm() {
		if (activeDialog?.kind !== 'confirm-dialog') {
			return
		}

		activeDialog.onConfirm?.()
		closeDialog()
	}

	function handleSecondaryAction() {
		if (activeDialog?.kind !== 'confirm-dialog') {
			return
		}

		activeDialog.onSecondaryAction?.()
		closeDialog()
	}

	return (
		<AlertDialog
			open={isOpen}
			onOpenChange={(open) => {
				if (!open) {
					closeDialog()
				}
			}}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogMedia>
						<CircleHelpIcon />
					</AlertDialogMedia>
					<AlertDialogTitle>
						{activeDialog?.kind === 'confirm-dialog' ? activeDialog.title : '确认操作'}
					</AlertDialogTitle>
					<AlertDialogDescription>
						{activeDialog?.kind === 'confirm-dialog' ? activeDialog.description : '当前操作需要确认。'}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<div className='flex w-full flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between'>
						<AlertDialogCancel>
							{activeDialog?.kind === 'confirm-dialog' ? (activeDialog.cancelLabel ?? '取消') : '取消'}
						</AlertDialogCancel>
						<div className='flex flex-col-reverse gap-2 sm:flex-row'>
							{activeDialog?.kind === 'confirm-dialog' && activeDialog.secondaryActionLabel ? (
								<AlertDialogAction
									variant='destructive'
									onClick={handleSecondaryAction}>
									{activeDialog.secondaryActionLabel}
								</AlertDialogAction>
							) : null}
							<AlertDialogAction onClick={handleConfirm}>
								{activeDialog?.kind === 'confirm-dialog' ? (activeDialog.confirmLabel ?? '确认') : '确认'}
							</AlertDialogAction>
						</div>
					</div>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}

export default ConfirmDialog
