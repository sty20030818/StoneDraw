import type { WorkbenchPanelKey } from '@/features/workbench/state'
import type { SaveStatus } from '@/shared/types'
import { resolveSaveStatusMeta } from './save-status'

type StatusBarProps = {
	activePanel: WorkbenchPanelKey
	documentId: string | null
	isDocumentReady: boolean
	isRightPanelOpen: boolean
	saveStatus: SaveStatus
}

function StatusBar({ activePanel, documentId, isDocumentReady, isRightPanelOpen, saveStatus }: StatusBarProps) {
	const statusMeta = resolveSaveStatusMeta(saveStatus)

	return (
		<footer className='flex min-h-8 shrink-0 flex-wrap items-center justify-between gap-3 border-t bg-card px-4 py-1.5 text-xs text-muted-foreground'>
			<div className='flex flex-wrap items-center gap-4'>
				<span>面板：{activePanel}</span>
				<span>保存：{statusMeta.label}</span>
				<span>{documentId ? `文档：${documentId}` : '文档未绑定'}</span>
			</div>
			<div className='flex flex-wrap items-center gap-4'>
				<span>{isDocumentReady ? '画布已就绪' : '画布准备中'}</span>
				<span>{isRightPanelOpen ? '右栏已展开' : '右栏已收起'}</span>
			</div>
		</footer>
	)
}

export default StatusBar
