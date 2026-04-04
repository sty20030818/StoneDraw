import type { ReactNode } from 'react'

type WorkbenchLayoutProps = {
	activityBar?: ReactNode
	sidePanel?: ReactNode
	tabsTitleBar?: ReactNode
	canvas?: ReactNode
	rightPanel?: ReactNode
	statusBar?: ReactNode
}

function WorkbenchLayout({
	activityBar,
	sidePanel,
	tabsTitleBar,
	canvas,
	rightPanel,
	statusBar,
}: WorkbenchLayoutProps) {
	return (
		<section className='flex h-full min-h-0 flex-1 overflow-hidden'>
			{activityBar ? <aside className='shrink-0'>{activityBar}</aside> : null}
			{sidePanel ? <aside className='shrink-0'>{sidePanel}</aside> : null}
			<div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
				{tabsTitleBar ? <div className='shrink-0'>{tabsTitleBar}</div> : null}
				<div className='min-h-0 flex-1 overflow-hidden'>{canvas ?? null}</div>
				{statusBar ? <div className='shrink-0'>{statusBar}</div> : null}
			</div>
			{rightPanel ? <aside className='shrink-0'>{rightPanel}</aside> : null}
		</section>
	)
}

export default WorkbenchLayout
