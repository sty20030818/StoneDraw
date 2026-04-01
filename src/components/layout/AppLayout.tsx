import { Outlet } from 'react-router-dom'

function AppLayout() {
	return (
		<div className='h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.10),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.98))] px-3 py-3 md:px-4 md:py-4'>
			<div className='mx-auto flex h-full min-h-0 max-w-400 flex-col overflow-hidden'>
				<Outlet />
			</div>
		</div>
	)
}

export default AppLayout
