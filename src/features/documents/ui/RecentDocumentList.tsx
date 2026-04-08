import type { DocumentMeta } from '@/shared/types'
import { formatDateTime } from '@/shared/lib/date'

type RecentDocumentListProps = {
	documents: DocumentMeta[]
	onOpen: (documentId: string) => void
}

function RecentDocumentList({ documents, onOpen }: RecentDocumentListProps) {
	return (
		<div className='mt-5 grid gap-3'>
			{documents.map((document) => (
				<button
					key={document.id}
					type='button'
					className='rounded-lg border bg-background px-4 py-4 text-left transition-colors hover:bg-muted/40'
					onClick={() => {
						onOpen(document.id)
					}}>
					<p className='text-sm font-semibold'>{document.title}</p>
					<p className='mt-2 text-xs text-muted-foreground'>
						最近打开：{document.lastOpenedAt ? formatDateTime(document.lastOpenedAt) : '尚未记录'}
					</p>
				</button>
			))}
		</div>
	)
}

export default RecentDocumentList
