import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { WORKSPACE_NAV_ITEMS } from '@/app/router'

function WorkspaceLayout() {
	const location = useLocation()
	const activeItem =
		WORKSPACE_NAV_ITEMS.find((item) => item.path === location.pathname) ?? WORKSPACE_NAV_ITEMS[0]

	return (
		<section className='flex h-full min-h-0 flex-1 overflow-hidden rounded-[1.75rem] border border-border/70 bg-background/82 shadow-sm backdrop-blur'>
			<aside className='flex w-72 shrink-0 flex-col border-r border-border/70 bg-card/75 p-4'>
				<div className='rounded-[1.25rem] border border-border/70 bg-background/90 px-4 py-4'>
					<p className='text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground'>Workspace</p>
					<h1 className='mt-2 text-lg font-semibold tracking-tight'>StoneDraw 管理态</h1>
					<p className='mt-2 text-sm leading-6 text-muted-foreground'>
						当前阶段先固定导航骨架与页面容器，后续再逐页接入真实业务能力。
					</p>
				</div>

				<nav className='mt-4 grid gap-2'>
					{WORKSPACE_NAV_ITEMS.map((item) => (
						<NavLink
							key={item.key}
							to={item.path}
							className={({ isActive }) =>
								[
									'rounded-[1.25rem] border px-4 py-3 text-left transition-colors',
									isActive
										? 'border-primary/35 bg-primary/10 text-foreground'
										: 'border-transparent bg-transparent text-muted-foreground hover:border-border/70 hover:bg-card/80 hover:text-foreground',
								].join(' ')
							}>
							<div className='text-sm font-medium'>{item.label}</div>
							<div className='mt-1 text-xs leading-5 text-muted-foreground'>{item.description}</div>
						</NavLink>
					))}
				</nav>
			</aside>

			<div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
				<header className='flex shrink-0 items-center justify-between gap-4 border-b border-border/70 bg-background/86 px-5 py-4'>
					<div>
						<p className='text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground'>当前页面</p>
						<h2 className='mt-2 text-lg font-semibold tracking-tight'>{activeItem.label}</h2>
					</div>
					<div className='flex items-center gap-2'>
						<div className='rounded-full border border-border/70 bg-card/90 px-4 py-2 text-xs text-muted-foreground'>全局搜索占位</div>
						<div className='rounded-full border border-border/70 bg-card/90 px-4 py-2 text-xs text-muted-foreground'>新建入口占位</div>
						<div className='rounded-full border border-border/70 bg-card/90 px-4 py-2 text-xs text-muted-foreground'>账户入口占位</div>
					</div>
				</header>

				<div className='min-h-0 flex-1 overflow-auto bg-background/60 p-5'>
					<Outlet />
				</div>
			</div>
		</section>
	)
}

export default WorkspaceLayout
