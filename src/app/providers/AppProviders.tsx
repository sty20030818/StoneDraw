import type { ReactNode } from 'react'
import { TooltipProvider } from '@/shared/ui/tooltip'

type AppProvidersProps = {
	children: ReactNode
}

function AppProviders({ children }: AppProvidersProps) {
	return <TooltipProvider>{children}</TooltipProvider>
}

export default AppProviders
