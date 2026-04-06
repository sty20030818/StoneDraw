import type { DocumentMeta } from '@/shared/types'

type ExplorerPanelProps = {
	documents: DocumentMeta[]
	activeDocumentId: string | null
	documentId: string | null
	documentTitle: string
	onSelectDocument: (documentId: string) => void
}

function ExplorerPanel({ documents, activeDocumentId, documentId, documentTitle, onSelectDocument }: ExplorerPanelProps) {
	return (
		<div className='grid gap-3'>
			<div className='rounded-[1.25rem] border border-border/70 bg-background/88 p-4'>
				<p className='text-sm font-medium'>Explorer</p>
				<div className='mt-3 grid gap-2'>
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
										'flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left transition',
										isActive
											? 'border-border bg-white text-foreground shadow-sm'
											: 'border-transparent bg-[#f7f9fd] text-muted-foreground hover:border-border/60 hover:bg-white',
									].join(' ')}>
									<span className='truncate text-sm'>{document.title}</span>
									<span className='ml-3 text-[10px] uppercase tracking-[0.18em]'>
										{isActive ? '当前' : '打开'}
									</span>
								</button>
							)
						})
					) : (
						<p className='text-xs leading-5 text-muted-foreground'>当前还没有可切换的文档，先从工作区创建或打开文档。</p>
					)}
				</div>
			</div>
			<div className='rounded-[1.25rem] border border-border/70 bg-background/88 p-4'>
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
