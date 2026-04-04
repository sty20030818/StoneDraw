import type { ReactNode } from 'react'
import AppProviders from '@/app/providers/AppProviders'
import OverlayRoot from '@/app/layouts/OverlayRoot'

type AppShellProps = {
	children: ReactNode
}

function AppShell({ children }: AppShellProps) {
	return (
		<AppProviders>
			{children}
			<OverlayRoot />
		</AppProviders>
	)
}

export default AppShell
