import { Outlet } from 'react-router-dom'

function AppLayout() {
	return (
		<div className='min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.10),_transparent_30%),linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(248,250,252,0.98))] px-3 py-3 md:px-4 md:py-4'>
			<div className='mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-400 flex-col'>
				<Outlet />
			</div>
		</div>
	)
}

export default AppLayout
