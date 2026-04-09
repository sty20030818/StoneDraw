import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

type WorkbenchShellFrameProps = {
	header: ReactNode
	canvas: ReactNode
	metaRail?: ReactNode
	className?: string
}

function WorkbenchShellFrame({ header, canvas, metaRail, className }: WorkbenchShellFrameProps) {
	return (
		<div
			data-testid='workbench-shell-frame'
			className={cn('flex min-h-0 min-w-0 flex-1 overflow-hidden', className)}>
			<div className='flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background'>
				<div>{header}</div>
				<div className='min-h-0 flex-1 overflow-hidden'>{canvas}</div>
			</div>
			{metaRail ? <div className='flex min-h-0 shrink-0 border-l bg-card'>{metaRail}</div> : null}
		</div>
	)
}

export default WorkbenchShellFrame
