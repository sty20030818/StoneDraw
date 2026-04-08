import { Outlet } from 'react-router-dom'
import { WindowChrome } from '@/app/chrome'
import { detectDesktopShellPlatform } from '@/app/chrome/platform-shell'
import { WorkspaceNav, WorkspaceTopbar } from '@/app/navigation'

function WorkspaceLayout() {
	const isMacShell = detectDesktopShellPlatform() === 'mac'

	return (
		<section className='flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background'>
			<WindowChrome />
			<div className='flex min-h-0 flex-1 overflow-hidden'>
				<aside className='flex w-64 shrink-0 flex-col border-r bg-card'>
					<div
						data-testid='workspace-nav-brand'
						data-tauri-drag-region
						className={['border-b px-4 py-4', isMacShell ? 'pl-16' : ''].join(' ')}>
						<p
							data-tauri-drag-region
							className='text-xs font-medium uppercase text-muted-foreground'>
							StoneDraw
						</p>
						<h1
							data-tauri-drag-region
							className='mt-1.5 text-base font-semibold text-foreground'>
							正式工作区
						</h1>
						<p
							data-tauri-drag-region
							className='mt-1.5 text-sm leading-6 text-muted-foreground'>
							统一管理首页、文档、归档与设置。
						</p>
					</div>
					<div className='min-h-0 flex-1 overflow-auto px-3 py-4'>
						<WorkspaceNav />
					</div>
				</aside>

				<div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
					<WorkspaceTopbar />
					<div className='min-h-0 flex-1 overflow-auto px-6 py-5'>
						<Outlet />
					</div>
				</div>
			</div>
		</section>
	)
}

export default WorkspaceLayout
