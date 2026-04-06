import { useLocation, useNavigate } from 'react-router-dom'
import { FilePlus2Icon, SearchIcon, Settings2Icon } from 'lucide-react'
import { WORKSPACE_NAV_ITEMS } from '@/app/router'
import { Button } from '@/shared/ui/button'
import { APP_ROUTES } from '@/shared/constants/routes'
import { useOverlayStore } from '@/stores/overlay.store'

function WorkspaceTopbar() {
	const location = useLocation()
	const navigate = useNavigate()
	const openOverlay = useOverlayStore((state) => state.openOverlay)
	const activeItem =
		WORKSPACE_NAV_ITEMS.find((item) => item.path === location.pathname) ?? WORKSPACE_NAV_ITEMS[0]

	return (
		<header className='flex shrink-0 items-center justify-between gap-4 border-b border-border/60 bg-white/90 px-6 py-4'>
			<div className='min-w-0'>
				<p className='text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground'>Shell Direction</p>
				<h2 className='mt-2 truncate font-[Bahnschrift,"Microsoft_YaHei_UI",sans-serif] text-[1.35rem] leading-none font-bold tracking-[0.02em]'>
					{activeItem.label}
				</h2>
				<p className='mt-2 text-sm text-muted-foreground'>{activeItem.description}</p>
			</div>
			<div className='flex items-center gap-2.5'>
				<Button
					type='button'
					variant='outline'
					className='h-9 rounded-xl bg-white px-4 shadow-sm'
					onClick={() => {
						navigate(APP_ROUTES.WORKSPACE_SEARCH)
					}}>
					<SearchIcon data-icon='inline-start' />
					搜索中心
				</Button>
				<Button
					type='button'
					className='h-9 rounded-xl bg-[linear-gradient(135deg,#1234a8,#1b4dff)] px-4 text-white shadow-[0_10px_24px_rgba(27,77,255,0.22)] hover:brightness-105'
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
					className='h-9 rounded-xl bg-white px-4 shadow-sm'
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
