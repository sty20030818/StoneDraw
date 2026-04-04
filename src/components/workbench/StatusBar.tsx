import type { SaveStatus } from '@/types'
import type { WorkbenchPanelKey } from './WorkbenchShellBridge'
import { resolveSaveStatusMeta } from './save-status'

type StatusBarProps = {
	activePanel: WorkbenchPanelKey
	documentId: string | null
	isDocumentReady: boolean
	saveStatus: SaveStatus
}

function StatusBar({ activePanel, documentId, isDocumentReady, saveStatus }: StatusBarProps) {
	const statusMeta = resolveSaveStatusMeta(saveStatus)

	return (
		<footer className='flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-border/70 bg-card/74 px-5 py-3 text-xs text-muted-foreground'>
			<div className='flex flex-wrap items-center gap-4'>
				<span>活动面板：{activePanel}</span>
				<span>保存状态：{statusMeta.label}</span>
				<span>{documentId ? `文档 ID：${documentId}` : '未绑定文档'}</span>
			</div>
			<div className='flex flex-wrap items-center gap-4'>
				<span>{isDocumentReady ? '画布已就绪' : '画布准备中'}</span>
				<span>缩放比例 / 协作状态 / 光标信息后续补齐</span>
			</div>
		</footer>
	)
}

export default StatusBar
