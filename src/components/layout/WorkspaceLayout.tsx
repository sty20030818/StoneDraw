import { Outlet } from 'react-router-dom'

function WorkspaceLayout() {
	return (
		<section className='flex h-full min-h-0 flex-1 overflow-hidden'>
			<div className='mx-auto flex h-full min-h-0 max-w-400 flex-1 flex-col overflow-hidden'>
				<Outlet />
			</div>
		</section>
	)
}

export default WorkspaceLayout
