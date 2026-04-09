import type { LucideIcon } from 'lucide-react'
import { ArrowRightIcon } from 'lucide-react'
import { PageSection, SectionHeader, WorkspacePageShell } from '@/shared/components'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui'

type PlaceholderCard = {
	title: string
	description: string
	label: string
}

type WorkspaceFeaturePlaceholderPageProps = {
	title: string
	description: string
	icon: LucideIcon
	eyebrow: string
	cards: PlaceholderCard[]
}

function WorkspaceFeaturePlaceholderPage({
	title,
	description,
	icon: Icon,
	eyebrow,
	cards,
}: WorkspaceFeaturePlaceholderPageProps) {
	return (
		<WorkspacePageShell>
			<div className='animate-in fade-in duration-300'>
				<div className='mb-7 space-y-2'>
					<p className='text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground'>{eyebrow}</p>
					<div className='flex items-start gap-4'>
						<div className='flex size-11 shrink-0 items-center justify-center rounded-2xl border bg-card shadow-sm'>
							<Icon className='size-5 text-muted-foreground' />
						</div>
						<div className='space-y-1.5'>
							<h1 className='text-3xl font-black tracking-tight text-foreground'>{title}</h1>
							<p className='max-w-3xl text-sm leading-6 text-muted-foreground'>{description}</p>
						</div>
					</div>
				</div>

				<PageSection
					header={
						<SectionHeader
							title='页面站位'
							description='当前先建立正式一级页骨架与内容区块，后续能力会沿着这些区块逐步接入。'
						/>
					}>
					<div className='grid gap-4 md:grid-cols-2'>
						{cards.map((card) => (
							<Card
								key={card.title}
								className='rounded-2xl border-border/80 shadow-sm'>
								<CardHeader className='gap-2'>
									<div className='inline-flex w-fit items-center rounded-full border border-border/80 bg-muted/50 px-2.5 py-1 text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase'>
										{card.label}
									</div>
									<CardTitle className='text-base font-semibold tracking-tight'>{card.title}</CardTitle>
									<CardDescription className='text-sm leading-6'>{card.description}</CardDescription>
								</CardHeader>
								<CardContent className='pt-0'>
									<Button
										type='button'
										variant='outline'
										size='sm'
										disabled>
										<ArrowRightIcon data-icon='inline-start' />
										后续接入
									</Button>
								</CardContent>
							</Card>
						))}
					</div>
				</PageSection>
			</div>
		</WorkspacePageShell>
	)
}

export default WorkspaceFeaturePlaceholderPage
