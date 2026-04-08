import { useLocation, useNavigate } from 'react-router-dom'
import { ArchiveIcon, FilePlus2Icon, Settings2Icon } from 'lucide-react'
import { WORKSPACE_NAV_ITEMS } from '@/app/router'
import { useOverlayStore } from '@/features/overlays'
import { Button } from '@/shared/ui/button'
import { APP_ROUTES } from '@/shared/constants/routes'

function WorkspaceTopbar() {
	const location = useLocation()
	const navigate = useNavigate()
	const openNewDocumentDialog = useOverlayStore((state) => state.openNewDocumentDialog)
	const activeItem = WORKSPACE_NAV_ITEMS.find((item) => item.path === location.pathname) ?? WORKSPACE_NAV_ITEMS[0]

	return (
		<header className='flex shrink-0 items-center justify-between gap-4 border-b bg-card px-6 py-4'>
			<div className='min-w-0'>
				<p className='text-xs font-medium uppercase text-muted-foreground'>Workspace</p>
				<h2 className='mt-1.5 truncate text-xl font-semibold leading-none'>{activeItem.label}</h2>
				<p className='mt-1.5 text-sm text-muted-foreground'>{activeItem.description}</p>
			</div>
			<div className='flex items-center gap-2.5'>
				<Button
					type='button'
					variant='outline'
					size='default'
					onClick={() => {
						navigate(APP_ROUTES.WORKSPACE_ARCHIVE)
					}}>
					<ArchiveIcon data-icon='inline-start' />
					回收站
				</Button>
				<Button
					type='button'
					size='default'
					onClick={() => {
						openNewDocumentDialog({
							source: 'workspace-topbar',
						})
					}}>
					<FilePlus2Icon data-icon='inline-start' />
					新建文档
				</Button>
				<Button
					type='button'
					variant='outline'
					size='default'
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
