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
						恢复入口已经统一并入 OverlayRoot，后续在这里继续接批量恢复、草稿检测与版本回退流程。
					</DialogDescription>
				</DialogHeader>
				<div className='rounded-md border border-dashed border-border/70 bg-card/60 p-4 text-sm leading-6 text-muted-foreground'>
					当前阶段 Archive 页面仍保留直接恢复动作，这个弹层只作为统一恢复入口，不再伪装成独立 feature。
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
