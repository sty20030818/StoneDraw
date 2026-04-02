import type { ReactNode } from 'react'

type WorkbenchLayoutProps = {
	topbar: ReactNode
	primary: ReactNode
	secondary: ReactNode
}

function WorkbenchLayout({ topbar, primary, secondary }: WorkbenchLayoutProps) {
	return (
		<section className='flex h-full min-h-0 flex-col gap-4 overflow-hidden'>
			<div className='shrink-0'>{topbar}</div>

			<div className='grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_22rem] gap-4 overflow-hidden'>
				<div className='min-w-0 min-h-0 overflow-hidden'>{primary}</div>
				<aside className='min-w-0 min-h-0 overflow-hidden'>{secondary}</aside>
			</div>
		</section>
	)
}

export default WorkbenchLayout
