import type { SaveStatus } from '@/shared/types'
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
		<aside className='flex h-full w-full shrink-0 flex-col border-l border-border/60 bg-white/88'>
			<div className='flex h-[42px] items-center justify-between border-b border-border/60 px-4'>
				<p className='text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground'>Properties</p>
				<span className='text-sm text-muted-foreground'>×</span>
			</div>
			<div className='mt-4 grid gap-3'>
				<div className='mx-4 rounded-[16px] border border-border/60 bg-[#f7f9fd] p-4'>
					<p className='text-sm font-medium'>当前文档</p>
					<p className='mt-2 text-sm text-muted-foreground'>
						{isDocumentReady ? documentTitle : '当前还没有可展示的文档标题'}
					</p>
					<p className='mt-2 text-xs text-muted-foreground'>
						{documentId ? `ID: ${documentId}` : '等待从 Workspace 带入文档上下文'}
					</p>
				</div>
				<div className='mx-4 rounded-[16px] border border-border/60 bg-[#f7f9fd] p-4'>
					<p className='text-sm font-medium'>保存状态</p>
					<p className='mt-2 text-sm'>{statusMeta.label}</p>
					<p className='mt-2 text-xs leading-5 text-muted-foreground'>{statusMeta.summary}</p>
				</div>
				<div className='mx-4 rounded-[16px] border border-dashed border-border/70 bg-[#f7f9fd] p-4 text-sm leading-6 text-muted-foreground'>
					右栏当前用于承载文档上下文与保存状态，避免工作台同时挂入未收口的附加入口。
				</div>
			</div>
		</aside>
	)
}

export default RightPanel
