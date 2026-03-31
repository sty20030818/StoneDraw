import type { LucideIcon } from 'lucide-react'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Button } from '@/components/ui/button'

type EmptyStateProps = {
	title: string
	description: string
	icon: LucideIcon
	actionLabel?: string
	onAction?: () => void
}

function EmptyState({ title, description, icon: Icon, actionLabel, onAction }: EmptyStateProps) {
	return (
		<Empty className='min-h-72 rounded-3xl border border-dashed border-border/80 bg-card/80 shadow-sm'>
			<EmptyHeader>
				<EmptyMedia variant='icon'>
					<Icon />
				</EmptyMedia>
				<EmptyTitle>{title}</EmptyTitle>
				<EmptyDescription>{description}</EmptyDescription>
			</EmptyHeader>

			{actionLabel && onAction ? (
				<EmptyContent>
					<Button
						type='button'
						onClick={onAction}>
						<Icon data-icon='inline-start' />
						{actionLabel}
					</Button>
				</EmptyContent>
			) : null}
		</Empty>
	)
}

export default EmptyState
