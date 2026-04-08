import type { WorkbenchPanelKey } from '@/features/workbench/state'
import type { SaveStatus } from '@/shared/types'
import { resolveSaveStatusMeta } from './save-status'

type StatusBarProps = {
	activePanel: WorkbenchPanelKey
	isDocumentReady: boolean
	isRightPanelOpen: boolean
	saveStatus: SaveStatus
}

function StatusBar({ activePanel, isDocumentReady, isRightPanelOpen, saveStatus }: StatusBarProps) {
	const statusMeta = resolveSaveStatusMeta(saveStatus)

	return (
		<footer className='flex min-h-7 shrink-0 flex-wrap items-center justify-between gap-3 border-t bg-card/90 px-4 py-1 text-[11px] text-muted-foreground'>
			<div className='flex flex-wrap items-center gap-3'>
				<span>面板：{activePanel}</span>
				<span>保存：{statusMeta.label}</span>
			</div>
			<div className='flex flex-wrap items-center gap-3'>
				<span>{isDocumentReady ? '画布已就绪' : '画布准备中'}</span>
				<span>{isRightPanelOpen ? '右栏已展开' : '右栏已收起'}</span>
			</div>
		</footer>
	)
}

export default StatusBar
