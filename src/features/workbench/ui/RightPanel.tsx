import { XIcon } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import type { SaveStatus } from '@/shared/types'
import { resolveSaveStatusMeta } from './save-status'

type RightPanelProps = {
	documentId: string | null
	documentTitle: string
	isDocumentReady: boolean
	saveStatus: SaveStatus
	onClose: () => void
}

function RightPanel({ documentId, documentTitle, isDocumentReady, saveStatus, onClose }: RightPanelProps) {
	const statusMeta = resolveSaveStatusMeta(saveStatus)

	return (
		<aside
			data-testid='workbench-right-panel'
			className='flex h-full w-full shrink-0 flex-col bg-card'>
			<div className='flex h-12 items-center justify-between border-b px-4'>
				<p className='text-xs font-medium uppercase text-muted-foreground'>Properties</p>
				<Button
					type='button'
					variant='ghost'
					size='icon-sm'
					title='收起右侧栏'
					onClick={onClose}>
					<XIcon />
				</Button>
			</div>
			<div className='grid gap-3 p-4'>
				<div className='rounded-lg border bg-background p-4'>
					<p className='text-sm font-medium'>当前文档</p>
					<p className='mt-2 text-sm text-muted-foreground'>
						{isDocumentReady ? documentTitle : '当前还没有可展示的文档标题'}
					</p>
					<p className='mt-2 text-xs text-muted-foreground'>
						{documentId ? `ID: ${documentId}` : '等待从 Workspace 带入文档上下文'}
					</p>
				</div>
				<div className='rounded-lg border bg-background p-4'>
					<p className='text-sm font-medium'>保存状态</p>
					<p className='mt-2 text-sm'>{statusMeta.label}</p>
					<p className='mt-2 text-xs leading-5 text-muted-foreground'>{statusMeta.summary}</p>
				</div>
				<div className='rounded-lg border border-dashed bg-background p-4 text-sm leading-6 text-muted-foreground'>
					右栏默认收起，仅在需要查看上下文或补充信息时展开。
				</div>
			</div>
		</aside>
	)
}

export default RightPanel
