import type { ReactNode } from 'react'

type DocumentCardGridProps = {
	children: ReactNode
}

function DocumentCardGrid({ children }: DocumentCardGridProps) {
	return <div className='mt-5 grid gap-3'>{children}</div>
}

export default DocumentCardGrid
