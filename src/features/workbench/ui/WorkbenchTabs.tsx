import type { SaveStatus } from '@/shared/types'
import type { WorkbenchTab } from '@/features/workbench/state'

type WorkbenchTabsProps = {
	tabs: WorkbenchTab[]
	activeTabId: string | null
	fallbackDocumentId: string | null
	fallbackDocumentTitle: string
	isDocumentReady: boolean
	activeSaveStatus: SaveStatus
	onSelectTab: (documentId: string) => void
	onCloseTab: (documentId: string) => void
}

function WorkbenchTabs({
	tabs,
	activeTabId,
	fallbackDocumentId,
	fallbackDocumentTitle,
	isDocumentReady,
	activeSaveStatus,
	onSelectTab,
	onCloseTab,
}: WorkbenchTabsProps) {
	const visibleTabs = tabs.length > 0 ? tabs : [{ id: fallbackDocumentId ?? 'pending', title: fallbackDocumentTitle }]

	return (
		<div className='scrollbar-hidden flex items-end gap-1.5 overflow-x-auto border-b bg-card px-3 pt-2'>
			{visibleTabs.map((tab) => {
				const isActive = tab.id === activeTabId || (tabs.length === 0 && tab.id === 'pending')
				const shouldShowUnsavedMarker = isActive && (activeSaveStatus === 'dirty' || activeSaveStatus === 'error')

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
							'group flex h-8.5 min-w-36 max-w-[15rem] items-center gap-2 rounded-t-md border border-b-0 px-3 text-left transition-colors',
							isActive
								? 'border-border bg-background text-foreground shadow-sm'
								: 'border-transparent bg-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground',
						].join(' ')}>
						<div className='flex min-w-0 items-center gap-2'>
							<p className='truncate text-sm font-medium'>
								{isDocumentReady ? tab.title : fallbackDocumentId ? '正在载入文档...' : '等待文档上下文'}
							</p>
							{shouldShowUnsavedMarker ? (
								<span
									className='size-2 shrink-0 rounded-full bg-amber-500'
									title='未保存变更'
								/>
							) : null}
						</div>
						{tab.id !== 'pending' ? (
							<span
								role='button'
								tabIndex={0}
								title='关闭标签'
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
								className='rounded-sm px-1 text-xs text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100'>
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
