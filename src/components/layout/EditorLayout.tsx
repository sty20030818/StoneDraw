import { Link, Outlet } from 'react-router-dom'
import { ArrowLeftIcon, Settings2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { APP_ROUTES } from '@/constants/routes'

function EditorLayout() {
	return (
		<section className='flex min-h-[calc(100vh-1.5rem)] flex-col overflow-hidden rounded-[1.75rem] border border-border/70 bg-card/82 shadow-sm backdrop-blur'>
			<header className='flex flex-col gap-3 border-b border-border/70 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-5'>
				<div className='flex items-center gap-3'>
					<Button
						asChild
						size='sm'
						variant='outline'>
						<Link to={APP_ROUTES.WORKSPACE}>
							<ArrowLeftIcon data-icon='inline-start' />
							返回工作区
						</Link>
					</Button>
					<Separator
						orientation='vertical'
						className='hidden h-6 md:block'
					/>
					<div className='flex flex-col gap-1'>
						<h2 className='text-base font-semibold'>编辑器场景</h2>
						<p className='text-sm text-muted-foreground'>这里固定承载 Excalidraw 画布、文档标题与编辑状态。</p>
					</div>
				</div>

				<Button
					asChild
					size='sm'
					variant='ghost'>
					<Link to={APP_ROUTES.SETTINGS}>
						<Settings2Icon data-icon='inline-start' />
						前往设置
					</Link>
				</Button>
			</header>

			<div className='min-h-0 flex-1 overflow-x-auto overflow-y-hidden p-4 md:p-5'>
				<div className='h-full min-h-0'>
					<Outlet />
				</div>
			</div>
		</section>
	)
}

export default EditorLayout
