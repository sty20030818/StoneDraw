import type { ReactNode } from 'react'
import AppProviders from '@/app/providers/AppProviders'
import AppWindowCloseBridge from '@/app/shell/AppWindowCloseBridge'
import AppToaster from '@/shared/components/AppToaster'

type AppShellProps = {
	children: ReactNode
}

function AppShell({ children }: AppShellProps) {
	return (
		<AppProviders>
			<AppWindowCloseBridge />
			<div
				data-testid='app-shell-root'
				className='flex h-screen min-h-0 flex-col overflow-hidden bg-background text-foreground'>
				{children}
			</div>
			<AppToaster />
		</AppProviders>
	)
}

export default AppShell
