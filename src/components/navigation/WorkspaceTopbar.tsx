import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FilePlus2Icon, SearchIcon, Settings2Icon } from 'lucide-react'
import { toast } from 'sonner'
import { WORKSPACE_NAV_ITEMS } from '@/app/router'
import { Button } from '@/components/ui/button'
import { APP_ROUTES, buildWorkbenchRoute } from '@/constants/routes'
import { documentService } from '@/services/document.service'
import { useWorkspaceStore } from '@/stores/workspace.store'

function WorkspaceTopbar() {
	const location = useLocation()
	const navigate = useNavigate()
	const setSelectedDocumentId = useWorkspaceStore((state) => state.setSelectedDocumentId)
	const [isCreating, setIsCreating] = useState(false)
	const activeItem =
		WORKSPACE_NAV_ITEMS.find((item) => item.path === location.pathname) ?? WORKSPACE_NAV_ITEMS[0]

	async function handleCreateDocument() {
		setIsCreating(true)
		const result = await documentService.create('未命名文档')
		setIsCreating(false)

		if (!result.ok) {
			toast.error(result.error.message)
			return
		}

		setSelectedDocumentId(result.data.id)
		navigate(buildWorkbenchRoute(result.data.id))
	}

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
					disabled={isCreating}
					onClick={() => {
						void handleCreateDocument()
					}}>
					<FilePlus2Icon data-icon='inline-start' />
					{isCreating ? '正在创建' : '新建文档'}
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
