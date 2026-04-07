import { Button } from '@/shared/ui/button'
import { useOverlayStore } from '@/features/overlays'

function TeamPage() {
	const openOverlay = useOverlayStore((state) => state.openOverlay)

	return (
		<div className='rounded-[1.75rem] border border-border/70 bg-card/78 p-6'>
			<div className='flex items-center justify-between gap-3'>
				<div>
					<h3 className='text-lg font-semibold tracking-tight'>Team 页面容器</h3>
					<p className='mt-3 text-sm leading-6 text-muted-foreground'>
						团队与共享页当前先作为真实落点保留，后续版本再逐步放大为共享文档、成员与团队空间入口。
					</p>
				</div>
				<Button
					type='button'
					variant='outline'
					onClick={() => {
						openOverlay('share', {
							source: 'team-page',
						})
					}}>
					打开分享面板
				</Button>
			</div>
		</div>
	)
}

export default TeamPage
