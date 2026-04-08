import type { ReactNode } from 'react'
import { Card, CardContent } from '@/shared/ui'
import { Separator } from '@/shared/ui/separator'
import { cn } from '@/shared/lib/utils'

type PageSectionProps = {
	header?: ReactNode
	children: ReactNode
	className?: string
	contentClassName?: string
}

function PageSection({ header, children, className, contentClassName }: PageSectionProps) {
	return (
		<Card
			data-testid='page-section'
			className={cn('overflow-hidden', className)}>
			{header ? (
				<>
					<div className='px-5 py-4'>{header}</div>
					<Separator />
				</>
			) : null}
			<CardContent className={cn('p-5', header ? '' : 'pt-5', contentClassName)}>{children}</CardContent>
		</Card>
	)
}

export default PageSection
