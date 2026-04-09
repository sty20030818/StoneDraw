import { detectDesktopShellPlatform } from './platform-shell'
import { cn } from '@/shared/lib/utils'

type WindowChromeBrandHeaderProps = {
	className?: string
	showBottomBorder?: boolean
}

function WindowChromeBrandHeader({ className, showBottomBorder = false }: WindowChromeBrandHeaderProps) {
	const shellPlatform = detectDesktopShellPlatform()
	const isMacShell = shellPlatform === 'mac'

	return (
		<header
			data-testid='window-chrome-brand-header'
			data-tauri-drag-region
			className={cn(
				'window-chrome-drag flex h-14 min-h-14 items-center bg-card/85',
				showBottomBorder && 'border-b',
				isMacShell ? 'pl-20 pr-4' : 'px-4',
				className,
			)}>
			<div
				data-testid='window-chrome-brand'
				data-tauri-drag-region
				className='window-chrome-drag flex min-w-0 items-center gap-2.5'>
				<div
					data-tauri-drag-region
					className='window-chrome-drag flex size-7 shrink-0 items-center justify-center rounded-md border bg-background shadow-sm'>
					<img
						src='/favicon.svg'
						alt='StoneDraw 图标'
						draggable={false}
						className='size-6'
					/>
				</div>
				<p
					data-tauri-drag-region
					className='window-chrome-drag truncate text-lg font-bold tracking-tight text-foreground'>
					StoneDraw
				</p>
			</div>
		</header>
	)
}

export default WindowChromeBrandHeader
