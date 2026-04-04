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
		<div className='flex items-center gap-3 border-b border-border/70 bg-card/65 px-5 py-3'>
			{visibleTabs.map((tab) => {
				const isActive = tab.id === activeTabId || (tabs.length === 0 && tab.id === 'pending')

				return (
					<div
						key={tab.id}
						className={[
							'flex min-w-0 items-center gap-2 rounded-[1rem] border px-4 py-2',
							isActive ? 'border-primary/35 bg-background/90' : 'border-border/70 bg-background/70',
						].join(' ')}>
						<div className='min-w-0'>
							<p className='truncate text-sm font-medium'>
								{isDocumentReady ? tab.title : fallbackDocumentId ? '正在载入文档...' : '等待文档上下文'}
							</p>
							<p className='mt-1 truncate text-[11px] text-muted-foreground'>
								{tab.id !== 'pending' ? `documentId: ${tab.id}` : '从 Workspace 进入后会绑定文档上下文'}
							</p>
						</div>
					</div>
				)
			})}
			<div className='rounded-full border border-dashed border-border/70 px-3 py-1 text-[11px] text-muted-foreground'>
				当前阶段仅保留单文档 Tab 骨架
			</div>
		</div>
	)
}

export default WorkbenchTabs
