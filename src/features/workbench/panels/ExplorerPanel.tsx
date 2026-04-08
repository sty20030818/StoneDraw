import type { DocumentMeta } from '@/shared/types'

type ExplorerPanelProps = {
	documents: DocumentMeta[]
	activeDocumentId: string | null
	documentId: string | null
	documentTitle: string
	onSelectDocument: (documentId: string) => void
}

function ExplorerPanel({
	documents,
	activeDocumentId,
	documentId,
	documentTitle,
	onSelectDocument,
}: ExplorerPanelProps) {
	return (
		<div className='grid gap-3'>
			<div className='grid gap-2'>
				{documents.length > 0 ? (
					documents.slice(0, 8).map((document) => {
						const isActive = document.id === activeDocumentId

						return (
							<button
								type='button'
								key={document.id}
								onClick={() => {
									onSelectDocument(document.id)
								}}
								className={[
									'flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left transition-colors',
									isActive
										? 'border-border bg-muted/60 text-foreground'
										: 'border-transparent bg-muted/30 text-muted-foreground hover:border-border hover:bg-background',
								].join(' ')}>
								<span className='truncate text-sm'>{document.title}</span>
								<span className='ml-3 text-[10px] uppercase'>{isActive ? '当前' : '打开'}</span>
							</button>
						)
					})
				) : (
					<p className='rounded-lg border border-dashed bg-muted/30 px-3 py-4 text-xs leading-5 text-muted-foreground'>
						当前还没有可切换的文档，先从工作区创建或打开文档。
					</p>
				)}
			</div>
			<div className='rounded-lg border bg-background p-4'>
				<p className='text-sm font-medium'>当前上下文</p>
				<p className='mt-2 text-sm text-muted-foreground'>{documentTitle}</p>
				<p className='mt-2 text-xs text-muted-foreground'>
					{documentId ? `documentId: ${documentId}` : '等待进入具体文档'}
				</p>
			</div>
		</div>
	)
}

export default ExplorerPanel
