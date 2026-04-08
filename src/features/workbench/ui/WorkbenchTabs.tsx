import type { WorkbenchTab } from '@/features/workbench/state'

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
		<div className='flex items-end gap-2 border-b bg-card px-3 pt-2'>
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
							'flex h-8.5 min-w-44 max-w-[16rem] items-center gap-2 rounded-t-lg border border-b-0 px-4 text-left transition-colors',
							isActive
								? 'border-border bg-background text-foreground'
								: 'border-transparent bg-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground',
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
								className='rounded-full px-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground'>
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
