import type { ReactNode } from 'react'
import AppProviders from '@/app/providers/AppProviders'
import AppToaster from '@/shared/components/AppToaster'

type AppShellProps = {
	children: ReactNode
}

function AppShell({ children }: AppShellProps) {
	return (
		<AppProviders>
			<div className='flex h-screen min-h-0 flex-col overflow-hidden bg-background'>
				<div
					data-testid='app-shell-root'
					className='flex min-h-0 flex-1 flex-col overflow-hidden'>
					{children}
				</div>
			</div>
			<AppToaster />
		</AppProviders>
	)
}

export default AppShell
