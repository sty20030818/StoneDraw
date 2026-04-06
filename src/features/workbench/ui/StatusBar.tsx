import type { WorkbenchPanelKey } from '@/features/workbench/state'
import type { SaveStatus } from '@/shared/types'
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
		<footer className='flex h-full shrink-0 flex-wrap items-center justify-between gap-3 bg-[#101b2f] px-4 text-xs text-slate-200/80'>
			<div className='flex flex-wrap items-center gap-4'>
				<span className='inline-flex h-6 items-center rounded-full bg-white/8 px-3'>活动面板：{activePanel}</span>
				<span className='inline-flex h-6 items-center rounded-full bg-white/8 px-3'>保存状态：{statusMeta.label}</span>
				<span className='inline-flex h-6 items-center rounded-full bg-white/8 px-3'>
					{documentId ? `文档 ID：${documentId}` : '未绑定文档'}
				</span>
			</div>
			<div className='flex flex-wrap items-center gap-4'>
				<span className='inline-flex h-6 items-center rounded-full bg-white/8 px-3'>
					{isDocumentReady ? '画布已就绪' : '画布准备中'}
				</span>
				<span className='inline-flex h-6 items-center rounded-full bg-white/8 px-3'>本地优先壳层</span>
			</div>
		</footer>
	)
}

export default StatusBar
