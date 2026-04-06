import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
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
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'

type DialogPayload = {
	title: string
	description: string
	content?: ReactNode
	confirmLabel?: string
}

type ConfirmDialogPayload = {
	title: string
	description: string
	confirmLabel?: string
	cancelLabel?: string
	onConfirm?: () => void
	secondaryActionLabel?: string
	onSecondaryAction?: () => void
}

type DialogHostContextValue = {
	openDialog: (payload: DialogPayload) => void
	openConfirmDialog: (payload: ConfirmDialogPayload) => void
}

const DialogHostContext = createContext<DialogHostContextValue | null>(null)

export function useDialogHost() {
	const context = useContext(DialogHostContext)

	if (!context) {
		throw new Error('useDialogHost 必须在 DialogHostProvider 内使用。')
	}

	return context
}

export function DialogHostProvider({ children }: { children: ReactNode }) {
	const [dialogPayload, setDialogPayload] = useState<DialogPayload | null>(null)
	const [confirmDialogPayload, setConfirmDialogPayload] = useState<ConfirmDialogPayload | null>(null)

	const openDialog = useCallback((payload: DialogPayload) => {
		setDialogPayload(payload)
	}, [])

	const openConfirmDialog = useCallback((payload: ConfirmDialogPayload) => {
		setConfirmDialogPayload(payload)
	}, [])

	const closeDialog = useCallback(() => {
		setDialogPayload(null)
	}, [])

	const closeConfirmDialog = useCallback(() => {
		setConfirmDialogPayload(null)
	}, [])

	const handleConfirm = useCallback(() => {
		confirmDialogPayload?.onConfirm?.()
		closeConfirmDialog()
	}, [closeConfirmDialog, confirmDialogPayload])

	const handleSecondaryAction = useCallback(() => {
		confirmDialogPayload?.onSecondaryAction?.()
		closeConfirmDialog()
	}, [closeConfirmDialog, confirmDialogPayload])

	const contextValue = useMemo<DialogHostContextValue>(
		() => ({
			openDialog,
			openConfirmDialog,
		}),
		[openConfirmDialog, openDialog],
	)

	return (
		<DialogHostContext.Provider value={contextValue}>
			{children}

			<Dialog
				open={Boolean(dialogPayload)}
				onOpenChange={(open) => {
					if (!open) {
						closeDialog()
					}
				}}>
				<DialogContent className='sm:max-w-lg'>
					<DialogHeader>
						<DialogTitle>{dialogPayload?.title ?? '说明弹窗'}</DialogTitle>
						<DialogDescription>{dialogPayload?.description ?? '当前仅验证全局 Dialog 容器。'}</DialogDescription>
					</DialogHeader>
					<div className='flex flex-col gap-3 text-sm text-muted-foreground'>
						{dialogPayload?.content ?? '这里是后续挂载详情视图、说明面板或轻量流程表单的统一入口。'}
					</div>
					<DialogFooter>
						<Button
							type='button'
							onClick={closeDialog}>
							关闭
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<AlertDialog
				open={Boolean(confirmDialogPayload)}
				onOpenChange={(open) => {
					if (!open) {
						closeConfirmDialog()
					}
				}}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogMedia>
							<CircleHelpIcon />
						</AlertDialogMedia>
						<AlertDialogTitle>{confirmDialogPayload?.title ?? '确认弹窗占位'}</AlertDialogTitle>
						<AlertDialogDescription>
							{confirmDialogPayload?.description ?? '当前仅建立统一确认容器，不执行真实危险操作。'}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<div className='flex w-full flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between'>
							<AlertDialogCancel>{confirmDialogPayload?.cancelLabel ?? '取消'}</AlertDialogCancel>
							<div className='flex flex-col-reverse gap-2 sm:flex-row'>
								{confirmDialogPayload?.secondaryActionLabel ? (
									<AlertDialogAction
										variant='destructive'
										onClick={handleSecondaryAction}>
										{confirmDialogPayload.secondaryActionLabel}
									</AlertDialogAction>
								) : null}
								<AlertDialogAction onClick={handleConfirm}>
									{confirmDialogPayload?.confirmLabel ?? '确认'}
								</AlertDialogAction>
							</div>
						</div>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</DialogHostContext.Provider>
	)
}
