type LibraryPanelProps = {
	documentId: string | null
	documentTitle: string
	isDocumentReady: boolean
}

function LibraryPanel({ documentId, documentTitle, isDocumentReady }: LibraryPanelProps) {
	return (
		<div className='grid gap-3'>
			<div className='rounded-[1.25rem] border border-border/70 bg-background/88 p-4'>
				<p className='text-sm font-medium'>Library</p>
				<p className='mt-2 text-xs leading-5 text-muted-foreground'>模板片段、组件资产和常用图形后续在这里集中展示。</p>
			</div>
			<div className='rounded-[1.25rem] border border-border/70 bg-background/88 p-4'>
				<p className='text-sm font-medium'>当前工作上下文</p>
				<p className='mt-2 text-sm text-muted-foreground'>
					{isDocumentReady ? documentTitle : '当前还没有可调用资源的 active document'}
				</p>
				<p className='mt-2 text-xs text-muted-foreground'>
					{documentId ? `ID: ${documentId}` : '等待进入具体文档后再调用资源'}
				</p>
			</div>
			<div className='rounded-[1.25rem] border border-dashed border-border/70 bg-background/70 p-4 text-sm leading-6 text-muted-foreground'>
				当前阶段先固定 Library 面板在工作台中的位置，不提前实现素材检索与插入能力。
			</div>
		</div>
	)
}

export default LibraryPanel
