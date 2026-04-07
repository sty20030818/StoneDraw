import type { ReactNode } from 'react'
import { DialogHostProvider } from '@/shared/components/DialogHost'
import { TooltipProvider } from '@/shared/ui/tooltip'

type AppProvidersProps = {
	children: ReactNode
}

function AppProviders({ children }: AppProvidersProps) {
	return (
		<TooltipProvider>
			<DialogHostProvider>{children}</DialogHostProvider>
		</TooltipProvider>
	)
}

export default AppProviders
