import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

type SectionHeaderProps = {
	title: string
	description?: string
	actions?: ReactNode
	className?: string
}

function SectionHeader({ title, description, actions, className }: SectionHeaderProps) {
	return (
		<div
			data-testid='section-header'
			className={cn('flex items-start justify-between gap-4', className)}>
			<div className='min-w-0'>
				<h3 className='text-base font-semibold tracking-tight text-foreground'>{title}</h3>
				{description ? <p className='mt-1.5 text-sm leading-6 text-muted-foreground'>{description}</p> : null}
			</div>
			{actions ? <div className='flex shrink-0 items-center gap-2'>{actions}</div> : null}
		</div>
	)
}

export default SectionHeader
