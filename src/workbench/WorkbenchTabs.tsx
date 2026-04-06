import type { WorkbenchTab } from '@/stores/workbench.store'

type WorkbenchTabsProps = {
	tabs: WorkbenchTab[]
	activeTabId: string | null
	fallbackDocumentId: string | null
	fallbackDocumentTitle: string
	isDocumentReady: boolean
}

function WorkbenchTabs({ tabs, activeTabId, fallbackDocumentId, fallbackDocumentTitle, isDocumentReady }: WorkbenchTabsProps) {
	const visibleTabs = tabs.length > 0 ? tabs : [{ id: fallbackDocumentId ?? 'pending', title: fallbackDocumentTitle }]

	return (
		<div className='flex items-end gap-2 border-b border-border/60 bg-[rgba(247,249,253,0.86)] px-3 pt-2'>
			{visibleTabs.map((tab) => {
				const isActive = tab.id === activeTabId || (tabs.length === 0 && tab.id === 'pending')

				return (
					<div
						key={tab.id}
						className={[
							'flex h-[34px] min-w-[11rem] max-w-[16rem] items-center gap-2 rounded-t-[14px] border border-b-0 px-4',
							isActive
								? 'border-border/70 bg-white text-foreground'
								: 'border-transparent bg-transparent text-[#68768e]',
						].join(' ')}>
						<div className='min-w-0'>
							<p className='truncate text-sm font-medium'>
								{isDocumentReady ? tab.title : fallbackDocumentId ? '正在载入文档...' : '等待文档上下文'}
							</p>
						</div>
					</div>
				)
			})}
			<div className='mb-1 ml-2 rounded-full border border-dashed border-border/70 px-3 py-1 text-[11px] text-muted-foreground'>
				当前阶段仅保留单文档 Tab 骨架
			</div>
		</div>
	)
}

export default WorkbenchTabs
