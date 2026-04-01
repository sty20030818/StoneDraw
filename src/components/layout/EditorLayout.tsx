import { Outlet } from 'react-router-dom'

function EditorLayout() {
	return (
		<section className='h-full min-h-0 flex-1 overflow-hidden'>
			<div className='mx-auto flex h-full min-h-0 max-w-400 flex-col overflow-hidden'>
				<Outlet />
			</div>
		</section>
	)
}

export default EditorLayout
