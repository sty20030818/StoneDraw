import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

type WorkbenchSidePanelProps = {
	label: string
	actions?: ReactNode
	description?: string
	children: ReactNode
	className?: string
}

function WorkbenchSidePanel({ label, actions, description, children, className }: WorkbenchSidePanelProps) {
	return (
		<aside
			data-testid='workbench-side-panel'
			className={cn('flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-card', className)}>
			<div className='flex h-12 shrink-0 items-center justify-between gap-2 px-3.5'>
				<p className='min-w-0 truncate text-xs font-medium uppercase text-muted-foreground'>{label}</p>
				{actions ? <div className='flex shrink-0 items-center gap-1'>{actions}</div> : null}
			</div>
			{description ? <div className='px-3.5 py-3 text-sm text-muted-foreground'>{description}</div> : null}
			<div className='scrollbar-hidden min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-3'>{children}</div>
		</aside>
	)
}

export default WorkbenchSidePanel
