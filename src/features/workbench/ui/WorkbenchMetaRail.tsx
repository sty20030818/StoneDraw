import type { ReactNode } from 'react'
import { Separator } from '@/shared/ui/separator'
import { cn } from '@/shared/lib/utils'

type WorkbenchMetaRailProps = {
	title: string
	actions?: ReactNode
	children: ReactNode
	className?: string
}

function WorkbenchMetaRail({ title, actions, children, className }: WorkbenchMetaRailProps) {
	return (
		<aside
			data-testid='workbench-meta-rail'
			className={cn('flex h-full w-80 shrink-0 flex-col bg-card', className)}>
			<div className='flex h-12 items-center justify-between px-4'>
				<p className='text-xs font-medium uppercase text-muted-foreground'>{title}</p>
				{actions ? <div className='flex items-center gap-1'>{actions}</div> : null}
			</div>
			<Separator />
			<div className='scrollbar-hidden min-h-0 flex-1 overflow-auto p-4'>{children}</div>
		</aside>
	)
}

export default WorkbenchMetaRail
