import { useNavigate } from 'react-router-dom'
import { APP_ROUTES } from '@/constants/routes'
import { useOverlayStore } from '@/stores/overlay.store'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'

function CommandPalette() {
	const navigate = useNavigate()
	const activeOverlay = useOverlayStore((state) => state.activeOverlay)
	const openOverlay = useOverlayStore((state) => state.openOverlay)
	const closeOverlay = useOverlayStore((state) => state.closeOverlay)
	const isOpen = activeOverlay === 'command-palette'

	function navigateAndClose(path: string) {
		navigate(path)
		closeOverlay()
	}

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => {
				if (!open) {
					closeOverlay()
				}
			}}>
			<DialogContent className='sm:max-w-2xl'>
				<DialogHeader>
					<DialogTitle>命令面板</DialogTitle>
					<DialogDescription>当前阶段先统一命令入口，后续再接入真正的搜索与动作匹配。</DialogDescription>
				</DialogHeader>
				<div className='grid gap-3'>
					<div className='grid gap-2 rounded-[1rem] border border-border/70 bg-card/60 p-4'>
						<Button
							type='button'
							variant='outline'
							onClick={() => {
								navigateAndClose(APP_ROUTES.WORKSPACE_HOME)
							}}>
							前往 Workspace Home
						</Button>
						<Button
							type='button'
							variant='outline'
							onClick={() => {
								navigateAndClose(APP_ROUTES.WORKSPACE_DOCUMENTS)
							}}>
							前往 Documents
						</Button>
						<Button
							type='button'
							variant='outline'
							onClick={() => {
								openOverlay('new-document', {
									source: 'command-palette',
								})
							}}>
							打开新建文档
						</Button>
					</div>
				</div>
				<DialogFooter showCloseButton />
			</DialogContent>
		</Dialog>
	)
}

export default CommandPalette
