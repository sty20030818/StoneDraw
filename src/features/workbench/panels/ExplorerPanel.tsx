import { formatRelativeTime, resolveDocumentCategory } from '@/features/documents/ui/document-ui'
import type { DocumentMeta } from '@/shared/types'

type ExplorerPanelProps = {
	documents: DocumentMeta[]
	activeDocumentId: string | null
	onSelectDocument: (documentId: string) => void
}

function ExplorerPanel({
	documents,
	activeDocumentId,
	onSelectDocument,
}: ExplorerPanelProps) {
	return (
		<div className='grid min-w-0 gap-1 overflow-x-hidden'>
			{documents.length > 0 ? (
				documents.map((document) => {
					const isActive = document.id === activeDocumentId

					return (
						<button
							type='button'
							key={document.id}
							onClick={() => {
								onSelectDocument(document.id)
							}}
							className={[
								'flex min-w-0 w-full flex-col gap-1 overflow-hidden rounded-md px-3 py-2 text-left transition-colors',
								isActive ? 'bg-muted text-foreground' : 'text-foreground hover:bg-muted/60',
							].join(' ')}>
							<p className='w-full truncate text-sm font-medium'>{document.title}</p>
							<div className='flex min-w-0 items-center justify-between gap-3 text-xs text-muted-foreground'>
								<span className='min-w-0 truncate'>{formatRelativeTime(document.lastOpenedAt ?? document.updatedAt)}</span>
								<span className='shrink-0'>{resolveDocumentCategory(document.title)}</span>
							</div>
						</button>
					)
				})
			) : (
				<p className='px-3 py-4 text-xs leading-5 text-muted-foreground'>当前还没有可切换的文档，先从工作区创建或打开文档。</p>
			)}
		</div>
	)
}

export default ExplorerPanel
