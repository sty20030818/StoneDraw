import type { SaveStatus } from '@/types'

type HistoryPanelProps = {
	saveStatus: SaveStatus
}

function HistoryPanel({ saveStatus }: HistoryPanelProps) {
	return (
		<div className='grid gap-3'>
			<div className='rounded-[1.25rem] border border-border/70 bg-background/88 p-4'>
				<p className='text-sm font-medium'>History</p>
				<p className='mt-2 text-xs leading-5 text-muted-foreground'>
					历史版本和活动记录后续接入，这里先展示工作台当前保存上下文。
				</p>
			</div>
			<div className='rounded-[1.25rem] border border-border/70 bg-background/88 p-4 text-sm text-muted-foreground'>
				当前保存状态：{saveStatus}
			</div>
		</div>
	)
}

export default HistoryPanel
