import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { WorkspaceNav, WorkspaceTopbar } from '@/components/navigation'
import { useWorkspaceStore, type WorkspaceSection } from '@/stores/workspace.store'

function WorkspaceLayout() {
	const location = useLocation()
	const setActiveSection = useWorkspaceStore((state) => state.setActiveSection)

	useEffect(() => {
		const section = location.pathname.split('/').at(-1) as WorkspaceSection | undefined

		if (section) {
			setActiveSection(section)
		}
	}, [location.pathname, setActiveSection])

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
				<WorkspaceNav />
			</aside>

			<div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
				<WorkspaceTopbar />
				<div className='min-h-0 flex-1 overflow-auto bg-background/60 p-5'>
					<Outlet />
				</div>
			</div>
		</section>
	)
}

export default WorkspaceLayout
