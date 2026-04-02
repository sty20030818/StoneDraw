import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export const SCENE_TOPBAR_CLASS =
	'grid grid-cols-[max-content_minmax(0,1fr)_max-content] items-center gap-4 rounded-[1.75rem] border border-border/70 bg-background/90 px-3 py-1.5 shadow-sm backdrop-blur'

export const SCENE_TOPBAR_SEARCH_INPUT_CLASS =
	'h-11 rounded-2xl border-primary/15 bg-white/95 pl-9 shadow-none focus-visible:border-primary/25 focus-visible:ring-primary/10'

type SceneTopbarProps = {
	left: ReactNode
	center: ReactNode
	right: ReactNode
	className?: string
	leftClassName?: string
	centerClassName?: string
	rightClassName?: string
}

function SceneTopbar({
	left,
	center,
	right,
	className,
	leftClassName,
	centerClassName,
	rightClassName,
}: SceneTopbarProps) {
	return (
		<div className={cn(SCENE_TOPBAR_CLASS, className)}>
			<div className={cn('min-w-0', leftClassName)}>{left}</div>
			<div className={cn('min-w-0 w-full max-w-152 justify-self-center', centerClassName)}>{center}</div>
			<div className={cn('min-w-0 justify-self-end', rightClassName)}>{right}</div>
		</div>
	)
}

export default SceneTopbar
