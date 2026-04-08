import { Outlet } from 'react-router-dom'
import { WindowChrome } from '@/app/chrome'
import { detectDesktopShellPlatform } from '@/app/chrome/platform-shell'
import { WorkspaceNav, WorkspaceTopbar } from '@/app/navigation'

function WorkspaceLayout() {
	const isMacShell = detectDesktopShellPlatform() === 'mac'

	return (
		<section className='flex h-full min-h-0 flex-1 overflow-hidden bg-background'>
			<aside className='flex w-62 shrink-0 flex-col border-r bg-card px-3 pb-4'>
				<div
					data-testid='workspace-nav-brand'
					data-tauri-drag-region
					className={['px-3 pt-3 pb-3', isMacShell ? 'pl-16' : ''].join(' ')}>
					<p
						data-tauri-drag-region
						className='text-xs font-medium uppercase text-muted-foreground'>
						Workspace
					</p>
					<h1
						data-tauri-drag-region
						className='mt-2 text-base font-semibold text-foreground'>
						StoneDraw 管理态
					</h1>
					<p
						data-tauri-drag-region
						className='mt-2 text-sm leading-6 text-muted-foreground'>
						保持 B 组本地主链路不动，只把导航壳、顶部工具条和页面容器收回正式桌面结构。
					</p>
				</div>
				<WorkspaceNav />
			</aside>

			<div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
				<WindowChrome />
				<WorkspaceTopbar />
				<div className='min-h-0 flex-1 overflow-auto p-6'>
					<Outlet />
				</div>
			</div>
		</section>
	)
}

export default WorkspaceLayout
