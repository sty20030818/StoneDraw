type WorkbenchTabsProps = {
	documentId: string | null
	documentTitle: string
	isDocumentReady: boolean
}

function WorkbenchTabs({ documentId, documentTitle, isDocumentReady }: WorkbenchTabsProps) {
	return (
		<div className='flex items-center gap-3 border-b border-border/70 bg-card/65 px-5 py-3'>
			<div className='flex min-w-0 items-center gap-2 rounded-[1rem] border border-border/70 bg-background/90 px-4 py-2'>
				<div className='min-w-0'>
					<p className='truncate text-sm font-medium'>
						{isDocumentReady ? documentTitle : documentId ? '正在载入文档...' : '等待文档上下文'}
					</p>
					<p className='mt-1 truncate text-[11px] text-muted-foreground'>
						{documentId ? `documentId: ${documentId}` : '从 Workspace 进入后会绑定文档上下文'}
					</p>
				</div>
			</div>
			<div className='rounded-full border border-dashed border-border/70 px-3 py-1 text-[11px] text-muted-foreground'>
				当前阶段仅保留单文档 Tab 骨架
			</div>
		</div>
	)
}

export default WorkbenchTabs
