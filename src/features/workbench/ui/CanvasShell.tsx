import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

type CanvasShellProps = {
	children: ReactNode
	className?: string
}

function CanvasShell({ children, className }: CanvasShellProps) {
	return <div className={cn('h-full min-h-0', className)}>{children}</div>
}

export default CanvasShell
