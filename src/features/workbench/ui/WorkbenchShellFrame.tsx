import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

type WorkbenchShellFrameProps = {
	tabs: ReactNode
	titleBar: ReactNode
	canvas: ReactNode
	metaRail?: ReactNode
	className?: string
}

function WorkbenchShellFrame({ tabs, titleBar, canvas, metaRail, className }: WorkbenchShellFrameProps) {
	return (
		<div
			data-testid='workbench-shell-frame'
			className={cn('flex min-h-0 min-w-0 flex-1 overflow-hidden', className)}>
			<div className='flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-muted/20'>
				<div>{tabs}</div>
				<div>{titleBar}</div>
				<div className='min-h-0 flex-1 overflow-hidden px-3 py-3'>{canvas}</div>
			</div>
			{metaRail ? <div className='flex min-h-0 shrink-0 border-l bg-card'>{metaRail}</div> : null}
		</div>
	)
}

export default WorkbenchShellFrame
