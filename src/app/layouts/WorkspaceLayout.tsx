import { Outlet } from 'react-router-dom'
import { AppShellHeader } from '@/app/shell'
import { WorkspaceNav } from '@/app/navigation'

function WorkspaceLayout() {
	return (
		<section className='flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background'>
			<AppShellHeader scene='workspace' />
			<div className='flex min-h-0 flex-1 overflow-hidden'>
				<aside className='flex w-72 shrink-0 flex-col border-r bg-card/85 backdrop-blur-sm'>
					<div className='min-h-0 flex-1 overflow-auto px-2.5 py-4'>
						<WorkspaceNav />
					</div>
				</aside>

				<div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
					<div className='min-h-0 flex-1 overflow-auto px-8 py-6'>
						<Outlet />
					</div>
				</div>
			</div>
		</section>
	)
}

export default WorkspaceLayout
