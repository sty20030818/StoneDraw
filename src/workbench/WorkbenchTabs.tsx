import type { WorkbenchTab } from '@/stores/workbench.store'

type WorkbenchTabsProps = {
	tabs: WorkbenchTab[]
	activeTabId: string | null
	fallbackDocumentId: string | null
	fallbackDocumentTitle: string
	isDocumentReady: boolean
	onSelectTab: (documentId: string) => void
	onCloseTab: (documentId: string) => void
}

function WorkbenchTabs({
	tabs,
	activeTabId,
	fallbackDocumentId,
	fallbackDocumentTitle,
	isDocumentReady,
	onSelectTab,
	onCloseTab,
}: WorkbenchTabsProps) {
	const visibleTabs = tabs.length > 0 ? tabs : [{ id: fallbackDocumentId ?? 'pending', title: fallbackDocumentTitle }]

	return (
		<div className='flex items-end gap-2 border-b border-border/60 bg-[rgba(247,249,253,0.86)] px-3 pt-2'>
			{visibleTabs.map((tab) => {
				const isActive = tab.id === activeTabId || (tabs.length === 0 && tab.id === 'pending')

				return (
					<button
						type='button'
						key={tab.id}
						onClick={() => {
							if (tab.id !== 'pending') {
								onSelectTab(tab.id)
							}
						}}
						className={[
							'flex h-8.5 min-w-44 max-w-[16rem] items-center gap-2 rounded-t-[14px] border border-b-0 px-4 text-left transition',
							isActive
								? 'border-border/70 bg-white text-foreground'
								: 'border-transparent bg-transparent text-[#68768e] hover:bg-white/55',
						].join(' ')}>
						<div className='min-w-0'>
							<p className='truncate text-sm font-medium'>
								{isDocumentReady ? tab.title : fallbackDocumentId ? '正在载入文档...' : '等待文档上下文'}
							</p>
						</div>
						{tab.id !== 'pending' ? (
							<span
								role='button'
								tabIndex={0}
								onClick={(event) => {
									event.stopPropagation()
									onCloseTab(tab.id)
								}}
								onKeyDown={(event) => {
									if (event.key === 'Enter' || event.key === ' ') {
										event.preventDefault()
										event.stopPropagation()
										onCloseTab(tab.id)
									}
								}}
								className='rounded-full px-1 text-xs text-muted-foreground hover:bg-black/5 hover:text-foreground'>
								×
							</span>
						) : null}
					</button>
				)
			})}
		</div>
	)
}

export default WorkbenchTabs
