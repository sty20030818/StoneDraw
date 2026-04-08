import type { ReactNode } from 'react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/shared/ui'
import { Separator } from '@/shared/ui/separator'
import { cn } from '@/shared/lib/utils'

type WorkspacePageShellProps = {
	title: string
	description?: string
	actions?: ReactNode
	toolbar?: ReactNode
	children: ReactNode
	className?: string
}

function WorkspacePageShell({
	title,
	description,
	actions,
	toolbar,
	children,
	className,
}: WorkspacePageShellProps) {
	return (
		<div
			data-testid='workspace-page-shell'
			className={cn('flex min-h-full flex-col gap-5', className)}>
			<Card>
				<CardHeader className='gap-4 p-5'>
					<div className='flex items-start justify-between gap-4'>
						<div className='min-w-0'>
							<CardTitle className='text-xl'>{title}</CardTitle>
							{description ? <CardDescription className='mt-2 leading-6'>{description}</CardDescription> : null}
						</div>
						{actions ? <div className='flex shrink-0 items-center gap-2'>{actions}</div> : null}
					</div>
					{toolbar ? (
						<>
							<Separator />
							<div className='pt-1'>{toolbar}</div>
						</>
					) : null}
				</CardHeader>
			</Card>
			<div className='flex flex-1 flex-col gap-5'>{children}</div>
		</div>
	)
}

export default WorkspacePageShell
