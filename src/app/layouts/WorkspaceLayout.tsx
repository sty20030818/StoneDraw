import type { ReactNode } from 'react'

type WorkspaceLayoutProps = {
	children?: ReactNode
	navigation?: ReactNode
	topbar?: ReactNode
	content?: ReactNode
}

function WorkspaceLayout({ children, navigation, topbar, content }: WorkspaceLayoutProps) {
	return (
		<section className='flex h-full min-h-0 flex-1 overflow-hidden'>
			{navigation ? <aside className='shrink-0'>{navigation}</aside> : null}
			<div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
				{topbar ? <div className='shrink-0'>{topbar}</div> : null}
				<div className='min-h-0 flex-1 overflow-hidden'>{children ?? content ?? null}</div>
			</div>
		</section>
	)
}

export default WorkspaceLayout
