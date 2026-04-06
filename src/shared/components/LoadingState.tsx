import { LoaderCircleIcon } from 'lucide-react'
import { Skeleton } from '@/shared/ui/skeleton'

type LoadingStateProps = {
	title: string
	description: string
}

function LoadingState({ title, description }: LoadingStateProps) {
	return (
		<section className='flex min-h-80 flex-col gap-6 rounded-xl border border-border/70 bg-card/85 p-6 shadow-sm backdrop-blur'>
			<div className='flex items-center gap-3'>
				<div className='flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
					<LoaderCircleIcon className='animate-spin' />
				</div>
				<div className='flex flex-col gap-1'>
					<h2 className='text-base font-semibold'>{title}</h2>
					<p className='text-sm text-muted-foreground'>{description}</p>
				</div>
			</div>

			<div className='grid gap-4 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]'>
				<div className='flex flex-col gap-3 rounded-3xl border bg-background/80 p-4'>
					<Skeleton className='h-5 w-24 rounded-full' />
					<Skeleton className='h-12 w-full rounded-2xl' />
					<Skeleton className='h-12 w-full rounded-2xl' />
					<Skeleton className='h-28 w-full rounded-3xl' />
				</div>
				<div className='flex min-h-96 flex-col gap-4 rounded-3xl border bg-background/80 p-4'>
					<Skeleton className='h-10 w-full rounded-2xl' />
					<Skeleton className='h-full w-full rounded-[1.75rem]' />
				</div>
			</div>
		</section>
	)
}

export default LoadingState
