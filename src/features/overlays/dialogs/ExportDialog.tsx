import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { useOverlayStore } from '../state'

function ExportDialog() {
	const activeOverlay = useOverlayStore((state) => state.activeOverlay)
	const context = useOverlayStore((state) => state.context)
	const closeOverlay = useOverlayStore((state) => state.closeOverlay)
	const isOpen = activeOverlay === 'export'

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => {
				if (!open) {
					closeOverlay()
				}
			}}>
			<DialogContent className='sm:max-w-lg'>
				<DialogHeader>
					<DialogTitle>导出面板</DialogTitle>
					<DialogDescription>
						导出流程已经进入统一 OverlayRoot，后续在这里接入图片、PDF 和分享链接导出。
					</DialogDescription>
				</DialogHeader>
				<div className='rounded-[1rem] border border-border/70 bg-card/60 p-4 text-sm text-muted-foreground'>
					<p>{context?.documentTitle ? `当前文档：${context.documentTitle}` : '当前没有绑定文档标题。'}</p>
					<p className='mt-2'>
						{context?.documentId ? `documentId: ${context.documentId}` : '等待工作台传入文档上下文。'}
					</p>
				</div>
				<DialogFooter showCloseButton>
					<Button
						type='button'
						onClick={closeOverlay}>
						知道了
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

export default ExportDialog
