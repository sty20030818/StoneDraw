import { Badge } from '@/shared/ui'
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
		<div
			data-testid='workbench-right-panel'
			className='grid gap-3'>
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
				<div className='flex items-center justify-between gap-3'>
					<p className='text-sm font-medium'>保存状态</p>
					<Badge
						className={statusMeta.className}
						variant='outline'>
						{statusMeta.label}
					</Badge>
				</div>
				<p className='mt-2 text-xs leading-5 text-muted-foreground'>{statusMeta.summary}</p>
			</div>
			<div className='rounded-lg border border-dashed bg-background p-4 text-sm leading-6 text-muted-foreground'>
				右栏保持轻量元信息定位，本轮不升级为复杂属性编辑器。
			</div>
		</div>
	)
}

export default RightPanel
