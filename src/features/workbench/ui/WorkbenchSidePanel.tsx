import type { ReactNode } from 'react'
import { Separator } from '@/shared/ui/separator'
import { cn } from '@/shared/lib/utils'

type WorkbenchSidePanelProps = {
	label: string
	description?: string
	children: ReactNode
	className?: string
}

function WorkbenchSidePanel({ label, description, children, className }: WorkbenchSidePanelProps) {
	return (
		<aside
			data-testid='workbench-side-panel'
			className={cn('flex min-h-0 w-72 flex-col border-l bg-card', className)}>
			<div
				data-tauri-drag-region
				className='flex h-12 items-center px-4'>
				<p className='text-xs font-medium uppercase text-muted-foreground'>{label}</p>
			</div>
			<Separator />
			{description ? <div className='px-4 py-3 text-sm text-muted-foreground'>{description}</div> : null}
			<div className='scrollbar-hidden min-h-0 flex-1 overflow-auto px-3 py-3'>{children}</div>
		</aside>
	)
}

export default WorkbenchSidePanel
