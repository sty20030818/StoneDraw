import type { ReactNode } from 'react'
import AppProviders from '@/app/providers/AppProviders'
import AppToaster from '@/components/feedback/AppToaster'
import OverlayRoot from '@/app/layouts/OverlayRoot'

type AppShellProps = {
	children: ReactNode
}

function AppShell({ children }: AppShellProps) {
	return (
		<AppProviders>
			<div className='h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.10),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.98))] px-3 py-3 md:px-4 md:py-4'>
				<div className='mx-auto flex h-full min-h-0 max-w-400 flex-col overflow-hidden'>
					{children}
				</div>
			</div>
			<OverlayRoot />
			<AppToaster />
		</AppProviders>
	)
}

export default AppShell
