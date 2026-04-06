import { useLocation, useNavigate } from 'react-router-dom'
import { FilePlus2Icon, SearchIcon, Settings2Icon } from 'lucide-react'
import { WORKSPACE_NAV_ITEMS } from '@/app/router'
import { Button } from '@/components/ui/button'
import { APP_ROUTES } from '@/constants/routes'
import { useOverlayStore } from '@/stores/overlay.store'

function WorkspaceTopbar() {
	const location = useLocation()
	const navigate = useNavigate()
	const openOverlay = useOverlayStore((state) => state.openOverlay)
	const activeItem =
		WORKSPACE_NAV_ITEMS.find((item) => item.path === location.pathname) ?? WORKSPACE_NAV_ITEMS[0]

	return (
		<header className='flex shrink-0 items-center justify-between gap-4 border-b border-border/70 bg-background/86 px-5 py-4'>
			<div>
				<p className='text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground'>当前页面</p>
				<h2 className='mt-2 text-lg font-semibold tracking-tight'>{activeItem.label}</h2>
			</div>
			<div className='flex items-center gap-2'>
				<Button
					type='button'
					variant='outline'
					onClick={() => {
						navigate(APP_ROUTES.WORKSPACE_SEARCH)
					}}>
					<SearchIcon data-icon='inline-start' />
					搜索中心
				</Button>
				<Button
					type='button'
					onClick={() => {
						openOverlay('new-document', {
							source: 'workspace-topbar',
						})
					}}>
					<FilePlus2Icon data-icon='inline-start' />
					新建文档
				</Button>
				<Button
					type='button'
					variant='outline'
					onClick={() => {
						navigate(APP_ROUTES.WORKSPACE_SETTINGS)
					}}>
					<Settings2Icon data-icon='inline-start' />
					设置
				</Button>
			</div>
		</header>
	)
}

export default WorkspaceTopbar
