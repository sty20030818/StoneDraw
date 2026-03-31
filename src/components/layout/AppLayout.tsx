import { Outlet, useLocation } from 'react-router-dom'
import { BadgeCheckIcon, CommandIcon, FolderOpenIcon, TerminalSquareIcon } from 'lucide-react'
import { APP_SCENES, resolveSceneByPathname } from '@/constants/routes'
import { useAppStore } from '@/stores'

function AppLayout() {
	const location = useLocation()
	const currentScene = resolveSceneByPathname(location.pathname)
	const bootStage = useAppStore((state) => state.bootStage)
	const commandBridgeStatus = useAppStore((state) => state.commandBridgeStatus)
	const localDirectoryStatus = useAppStore((state) => state.localDirectoryStatus)
	const lastCommandName = useAppStore((state) => state.lastCommandName)

	return (
		<div className='min-h-screen px-3 py-3 md:px-4 md:py-4'>
			<div className='mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-400 flex-col gap-3'>
				<header className='flex flex-col gap-4 rounded-xl border border-border/70 bg-card/80 px-5 py-4 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between'>
					<div className='flex flex-col gap-2'>
						<div className='flex flex-wrap items-center gap-2'>
							<span className='rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold tracking-[0.16em] text-primary uppercase'>
								StoneDraw 0.2.0
							</span>
							<span className='rounded-full border border-border/80 bg-background/80 px-3 py-1 text-xs text-muted-foreground'>
								{currentScene.label}
							</span>
						</div>
						<div className='flex flex-col gap-1'>
							<h1 className='text-xl font-semibold tracking-tight'>固定本地目录根到 ~/.stonedraw</h1>
							<p className='text-sm text-muted-foreground'>{currentScene.description}</p>
						</div>
					</div>

					<div className='grid gap-2 sm:grid-cols-2 xl:grid-cols-4'>
						<div className='rounded-2xl border border-border/70 bg-background/80 px-3 py-2'>
							<div className='flex items-center gap-2 text-xs font-medium text-muted-foreground'>
								<BadgeCheckIcon />
								启动阶段
							</div>
							<p className='mt-1 text-sm font-medium'>{bootStage}</p>
						</div>
						<div className='rounded-2xl border border-border/70 bg-background/80 px-3 py-2'>
							<div className='flex items-center gap-2 text-xs font-medium text-muted-foreground'>
								<CommandIcon />
								命令桥接
							</div>
							<p className='mt-1 text-sm font-medium'>{commandBridgeStatus}</p>
						</div>
						<div className='rounded-2xl border border-border/70 bg-background/80 px-3 py-2'>
							<div className='flex items-center gap-2 text-xs font-medium text-muted-foreground'>
								<FolderOpenIcon />
								本地目录
							</div>
							<p className='mt-1 text-sm font-medium'>{localDirectoryStatus}</p>
						</div>
						<div className='rounded-2xl border border-border/70 bg-background/80 px-3 py-2'>
							<div className='flex items-center gap-2 text-xs font-medium text-muted-foreground'>
								<TerminalSquareIcon />
								最近命令
							</div>
							<p className='mt-1 truncate text-sm font-medium'>{lastCommandName ?? APP_SCENES.workspace.path}</p>
						</div>
					</div>
				</header>

				<div className='min-h-0 flex-1'>
					<Outlet />
				</div>
			</div>
		</div>
	)
}

export default AppLayout
