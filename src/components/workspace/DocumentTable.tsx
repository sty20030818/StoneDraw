import type { DocumentMeta } from '@/types'
import { formatDateTime } from '@/utils/date'

type DocumentTableProps = {
	documents: DocumentMeta[]
}

function DocumentTable({ documents }: DocumentTableProps) {
	return (
		<div className='overflow-hidden rounded-[1.25rem] border border-border/70 bg-background/88'>
			<div className='grid grid-cols-[minmax(0,1.4fr)_10rem_8rem] gap-3 border-b border-border/70 px-4 py-3 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground'>
				<span>文档</span>
				<span>更新时间</span>
				<span>保存状态</span>
			</div>
			<div className='divide-y divide-border/60'>
				{documents.map((document) => (
					<div
						key={document.id}
						className='grid grid-cols-[minmax(0,1.4fr)_10rem_8rem] gap-3 px-4 py-3 text-sm'>
						<span className='truncate font-medium'>{document.title}</span>
						<span className='text-muted-foreground'>{formatDateTime(document.updatedAt)}</span>
						<span className='capitalize text-muted-foreground'>{document.saveStatus}</span>
					</div>
				))}
			</div>
		</div>
	)
}

export default DocumentTable
