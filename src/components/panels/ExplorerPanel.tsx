type ExplorerPanelProps = {
	documentId: string | null
	documentTitle: string
}

function ExplorerPanel({ documentId, documentTitle }: ExplorerPanelProps) {
	return (
		<div className='grid gap-3'>
			<div className='rounded-[1.25rem] border border-border/70 bg-background/88 p-4'>
				<p className='text-sm font-medium'>Explorer</p>
				<p className='mt-2 text-xs leading-5 text-muted-foreground'>
					这里先承接文档结构、页面树和图层浏览等入口。
				</p>
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
