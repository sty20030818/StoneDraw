import type { ReactNode } from 'react'
import AppProviders from '@/app/providers/AppProviders'
import AppToaster from '@/shared/components/AppToaster'

type AppShellProps = {
	children: ReactNode
}

function AppShell({ children }: AppShellProps) {
	return (
		<AppProviders>
			<div className='flex h-screen min-h-0 flex-col overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(27,77,255,0.09),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.08),transparent_22%),linear-gradient(180deg,#f7f9fd_0%,#ebf0f7_100%)]'>
				<div className='flex min-h-0 flex-1 flex-col overflow-hidden'>{children}</div>
			</div>
			<AppToaster />
		</AppProviders>
	)
}

export default AppShell
