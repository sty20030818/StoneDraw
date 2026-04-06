import { Button } from '@/shared/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/shared/ui/dialog'
import { useOverlayStore } from '@/stores/overlay.store'

function ShareDialog() {
	const activeOverlay = useOverlayStore((state) => state.activeOverlay)
	const context = useOverlayStore((state) => state.context)
	const closeOverlay = useOverlayStore((state) => state.closeOverlay)
	const isOpen = activeOverlay === 'share'

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
					<DialogTitle>分享与协作</DialogTitle>
					<DialogDescription>分享入口已经统一进入 OverlayRoot，后续在这里接入成员邀请、权限和共享链接。</DialogDescription>
				</DialogHeader>
				<div className='rounded-[1rem] border border-border/70 bg-card/60 p-4 text-sm text-muted-foreground'>
					<p>{context?.documentTitle ? `准备分享：${context.documentTitle}` : '当前没有绑定具体文档。'}</p>
				</div>
				<DialogFooter showCloseButton>
					<Button
						type='button'
						onClick={closeOverlay}>
						关闭
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

export default ShareDialog
