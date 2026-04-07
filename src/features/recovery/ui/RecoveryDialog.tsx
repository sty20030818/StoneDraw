import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { useOverlayStore } from '@/features/overlays'

function RecoveryDialog() {
	const activeOverlay = useOverlayStore((state) => state.activeOverlay)
	const closeOverlay = useOverlayStore((state) => state.closeOverlay)
	const isOpen = activeOverlay === 'recovery'

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
					<DialogTitle>恢复中心</DialogTitle>
					<DialogDescription>
						恢复相关入口已经进入统一 OverlayRoot，后续会把批量恢复与历史版本恢复收口到这里。
					</DialogDescription>
				</DialogHeader>
				<div className='rounded-[1rem] border border-dashed border-border/70 bg-card/60 p-4 text-sm leading-6 text-muted-foreground'>
					当前阶段 Archive 页面仍保留直接恢复按钮，这个弹层先作为统一承载位保留。
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

export default RecoveryDialog
