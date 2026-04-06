import type { ReactNode } from 'react'

type CanvasShellProps = {
	children: ReactNode
	className?: string
}

function CanvasShell({ children, className }: CanvasShellProps) {
	return <div className={className}>{children}</div>
}

export default CanvasShell
