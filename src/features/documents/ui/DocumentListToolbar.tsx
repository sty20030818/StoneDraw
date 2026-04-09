import type { ReactNode } from 'react'
import { FilterIcon, ListFilterIcon, PlusIcon, RefreshCwIcon, SearchIcon } from 'lucide-react'
import { Button, Input } from '@/shared/ui'

type DocumentListToolbarProps = {
	documentCount: number
	searchDraft: string
	onSearchChange: (value: string) => void
	onRefresh: () => void
	onCreate: () => void
	viewControl?: ReactNode
}

function DocumentListToolbar({
	documentCount,
	searchDraft,
	onSearchChange,
	onRefresh,
	onCreate,
	viewControl,
}: DocumentListToolbarProps) {
	return (
		<div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
			<div className='relative min-w-72 flex-1'>
				<SearchIcon className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
				<Input
					type='search'
					className='h-10 rounded-md bg-card pl-9'
					value={searchDraft}
					onChange={(event) => {
						onSearchChange(event.target.value)
					}}
					placeholder='搜索文档标题或路径'
				/>
			</div>
			<div className='flex flex-wrap items-center gap-2'>
				<Button
					type='button'
					variant='outline'
					size='sm'>
					<ListFilterIcon data-icon='inline-start' />
					最近更新
				</Button>
				<Button
					type='button'
					variant='outline'
					size='sm'>
					<FilterIcon data-icon='inline-start' />
					全部状态
				</Button>
				{viewControl}
				<span className='px-2 text-xs text-muted-foreground'>{documentCount} 个文档</span>
				<Button
					type='button'
					variant='outline'
					size='sm'
					onClick={onRefresh}>
					<RefreshCwIcon data-icon='inline-start' />
					刷新
				</Button>
				<Button
					type='button'
					size='sm'
					onClick={onCreate}>
					<PlusIcon data-icon='inline-start' />
					新建文档
				</Button>
			</div>
		</div>
	)
}

export default DocumentListToolbar
