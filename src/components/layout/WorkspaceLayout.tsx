import { Link, Outlet, useLocation } from 'react-router-dom'
import { CircleHelpIcon, FolderKanbanIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { APP_ROUTES, MAIN_NAV_ITEMS, resolveSceneByPathname } from '@/constants/routes'

function WorkspaceLayout() {
	const location = useLocation()
	const currentScene = resolveSceneByPathname(location.pathname)

	return (
		<section className='flex min-h-[calc(100vh-1.5rem)] gap-4 overflow-hidden'>
			<aside className='hidden w-60 shrink-0 rounded-[1.75rem] border border-border/70 bg-card/88 p-4 shadow-sm lg:flex lg:flex-col'>
				<div className='rounded-[1.25rem] border border-border/70 bg-background/85 px-4 py-4'>
					<div className='flex items-center gap-3'>
						<div className='flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
							<FolderKanbanIcon />
						</div>
						<div className='flex flex-col gap-1'>
							<p className='text-base font-semibold tracking-tight'>StoneDraw</p>
							<p className='text-xs leading-5 text-muted-foreground'>本地白板工作台，围绕文档、画布与恢复链路组织体验。</p>
						</div>
					</div>
				</div>

				<nav className='mt-5 flex flex-1 flex-col'>
					<div className='flex flex-col gap-2'>
						<p className='px-2 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase'>主导航</p>
						<div className='grid gap-1.5'>
							{MAIN_NAV_ITEMS.map((item) => {
								const Icon = item.icon
								const isActive = item.key === currentScene.key

								return (
									<Link
										key={item.key}
										to={item.path}
										className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition-colors ${
											isActive
												? 'bg-primary text-primary-foreground shadow-sm'
												: 'text-foreground hover:bg-background hover:text-foreground'
										}`}>
										<span className='flex size-5 shrink-0 items-center justify-center'>
											{Icon ? <Icon className='size-4 shrink-0' /> : null}
										</span>
										<span className='truncate'>{item.label}</span>
									</Link>
								)
							})}
						</div>
					</div>
				</nav>

				<div className='rounded-[1.25rem] border border-border/70 bg-background/82 px-4 py-4 text-sm'>
					<p className='text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase'>当前场景</p>
					<p className='mt-3 font-medium'>{currentScene.label}</p>
					<p className='mt-2 leading-6 text-muted-foreground'>{currentScene.description}</p>
				</div>
			</aside>

			<div className='flex min-w-0 flex-1 flex-col overflow-hidden rounded-[1.75rem] border border-border/70 bg-card/82 shadow-sm backdrop-blur'>
				<header className='flex flex-col gap-4 border-b border-border/70 bg-background/72 px-4 py-4 md:px-5'>
					<div className='flex flex-wrap items-start justify-between gap-3'>
						<div className='flex flex-col gap-1'>
							<p className='text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase'>工作台</p>
							<h2 className='text-xl font-semibold tracking-tight'>{currentScene.label}</h2>
							<p className='text-sm text-muted-foreground'>{currentScene.description}</p>
						</div>
						<div className='flex flex-wrap items-center gap-2'>
							<Button
								asChild
								size='sm'
								variant='outline'>
								<Link to={APP_ROUTES.SETTINGS}>查看设置</Link>
							</Button>
						</div>
					</div>

					<div className='flex flex-wrap items-center gap-3 text-sm text-muted-foreground'>
						<div className='inline-flex h-8 min-w-[18rem] items-center justify-center gap-2 rounded-full border border-border/70 bg-card px-4'>
							<CircleHelpIcon className='size-4' />
							<span>工作区、设置与编辑器统一归入桌面工作台布局。</span>
						</div>
					</div>
				</header>

				<div className='min-h-0 flex-1 overflow-auto p-4 md:p-5'>
					<div className='mx-auto flex min-h-full max-w-[1600px] flex-col'>
						<Outlet />
					</div>
				</div>
			</div>
		</section>
	)
}

export default WorkspaceLayout
