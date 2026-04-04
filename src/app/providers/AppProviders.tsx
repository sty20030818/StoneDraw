import type { ReactNode } from 'react'
import { DialogHostProvider } from '@/components/feedback/DialogHost'
import { TooltipProvider } from '@/components/ui/tooltip'

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
