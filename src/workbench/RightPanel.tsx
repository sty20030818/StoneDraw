import type { SaveStatus } from '@/types'
import { resolveSaveStatusMeta } from './save-status'

type RightPanelProps = {
	documentId: string | null
	documentTitle: string
	isDocumentReady: boolean
	saveStatus: SaveStatus
}

function RightPanel({ documentId, documentTitle, isDocumentReady, saveStatus }: RightPanelProps) {
	const statusMeta = resolveSaveStatusMeta(saveStatus)

	return (
		<aside className='flex w-80 shrink-0 flex-col border-l border-border/70 bg-card/72 p-4'>
			<p className='text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground'>Right Panel</p>
			<h2 className='mt-2 text-base font-semibold tracking-tight'>属性与协作右栏</h2>
			<div className='mt-4 grid gap-3'>
				<div className='rounded-[1.25rem] border border-border/70 bg-background/88 p-4'>
					<p className='text-sm font-medium'>当前文档</p>
					<p className='mt-2 text-sm text-muted-foreground'>
						{isDocumentReady ? documentTitle : '当前还没有可展示的文档标题'}
					</p>
					<p className='mt-2 text-xs text-muted-foreground'>
						{documentId ? `ID: ${documentId}` : '等待从 Workspace 带入文档上下文'}
					</p>
				</div>
				<div className='rounded-[1.25rem] border border-border/70 bg-background/88 p-4'>
					<p className='text-sm font-medium'>保存状态</p>
					<p className='mt-2 text-sm'>{statusMeta.label}</p>
					<p className='mt-2 text-xs leading-5 text-muted-foreground'>{statusMeta.summary}</p>
				</div>
				<div className='rounded-[1.25rem] border border-dashed border-border/70 bg-background/70 p-4 text-sm leading-6 text-muted-foreground'>
					当前阶段先固定右栏位置，后续继续接入属性面板、评论、导出与分享相关能力。
				</div>
			</div>
		</aside>
	)
}

export default RightPanel
