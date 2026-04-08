import type { LucideIcon } from 'lucide-react'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/shared/ui/empty'
import { Button } from '@/shared/ui/button'

type EmptyStateProps = {
	title: string
	description: string
	icon: LucideIcon
	actionLabel?: string
	onAction?: () => void
}

function EmptyState({ title, description, icon: Icon, actionLabel, onAction }: EmptyStateProps) {
	return (
		<Empty className='min-h-72 rounded-xl border border-dashed bg-card'>
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
