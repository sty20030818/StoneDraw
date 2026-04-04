type SearchPanelProps = {
	searchDraft: string
}

function SearchPanel({ searchDraft }: SearchPanelProps) {
	return (
		<div className='grid gap-3'>
			<div className='rounded-[1.25rem] border border-border/70 bg-background/88 p-4'>
				<p className='text-sm font-medium'>Search</p>
				<p className='mt-2 text-xs leading-5 text-muted-foreground'>
					工作台搜索暂时只保留输入状态和结果容器，后续再接入真正的画布检索。
				</p>
			</div>
			<div className='rounded-[1.25rem] border border-dashed border-border/70 bg-background/70 p-4 text-sm text-muted-foreground'>
				{searchDraft ? `当前搜索词：${searchDraft}` : '当前还没有输入搜索关键词'}
			</div>
		</div>
	)
}

export default SearchPanel
