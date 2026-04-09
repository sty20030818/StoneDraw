import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

type WorkspacePageShellProps = {
	title?: string
	description?: string
	actions?: ReactNode
	toolbar?: ReactNode
	children: ReactNode
	className?: string
}

function WorkspacePageShell({ toolbar, children, className }: WorkspacePageShellProps) {
	return (
		<div
			data-testid='workspace-page-shell'
			className={cn('flex min-h-full flex-col gap-5', className)}>
			{toolbar ? <div className='flex flex-col gap-3'>{toolbar}</div> : null}
			<div className='flex flex-1 flex-col gap-5'>{children}</div>
		</div>
	)
}

export default WorkspacePageShell
