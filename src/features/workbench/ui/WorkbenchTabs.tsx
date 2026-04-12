import { PanelRightClose, PanelRightOpen, XIcon } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button, Tabs, TabsList, TabsTrigger } from '@/shared/ui'
import type { SaveStatus } from '@/shared/types'
import type { WorkbenchTab } from '@/features/workbench/state'

type WorkbenchTabsProps = {
	tabs: WorkbenchTab[]
	activeTabId: string | null
	fallbackDocumentId: string | null
	fallbackDocumentTitle: string
	isDocumentReady: boolean
	activeSaveStatus: SaveStatus
	isRightPanelOpen: boolean
	onSelectTab: (documentId: string) => void
	onCloseTab: (documentId: string) => void
	onToggleRightPanel: () => void
}

function WorkbenchTabs({
	tabs,
	activeTabId,
	fallbackDocumentId,
	fallbackDocumentTitle,
	isDocumentReady,
	activeSaveStatus,
	isRightPanelOpen,
	onSelectTab,
	onCloseTab,
	onToggleRightPanel,
}: WorkbenchTabsProps) {
	const visibleTabs = tabs.length > 0 ? tabs : [{ id: fallbackDocumentId ?? 'pending', title: fallbackDocumentTitle }]
	const currentTabValue =
		visibleTabs.find((tab) => tab.id === activeTabId)?.id ?? visibleTabs[0]?.id ?? 'pending'

	return (
		<div className='flex h-12 items-center justify-between border-b bg-card pl-3 pr-2'>
			<Tabs
				value={currentTabValue}
				onValueChange={(value) => {
					if (value !== 'pending') {
						onSelectTab(value)
					}
				}}
				className='min-w-0 flex-1 gap-0'>
				<div className='scrollbar-hidden overflow-x-auto'>
					<TabsList className='h-auto gap-1 rounded-none border-0 bg-transparent p-0 text-foreground shadow-none'>
							{visibleTabs.map((tab) => {
								const isActive = tab.id === currentTabValue
								const isPendingTab = tab.id === 'pending'
								const shouldShowLoadingTitle =
									!isDocumentReady && fallbackDocumentId === tab.id && isActive
								const shouldShowUnsavedMarker = isActive && (activeSaveStatus === 'dirty' || activeSaveStatus === 'error')

								return (
								<div
									key={tab.id}
									className='group relative shrink-0'>
									<TabsTrigger
										value={tab.id}
										disabled={tab.id === 'pending'}
										className={cn(
											'h-8 min-w-36 max-w-[15rem] justify-start rounded-md border border-transparent bg-transparent px-3 pr-8 text-left text-sm shadow-none',
											'hover:bg-muted/50 hover:text-foreground',
											'data-[state=active]:border-border data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-none',
											'data-[state=inactive]:text-muted-foreground',
											tab.id === 'pending' && 'pr-3',
										)}>
											<div className='flex min-w-0 items-center gap-2'>
												<p className='truncate'>
													{isPendingTab
														? fallbackDocumentId
															? '正在载入文档...'
															: '等待文档上下文'
														: shouldShowLoadingTitle
															? '正在载入文档...'
															: tab.title}
												</p>
												{shouldShowUnsavedMarker ? (
												<span
													className='size-2 shrink-0 rounded-full bg-amber-500'
													title='未保存变更'
												/>
											) : null}
										</div>
									</TabsTrigger>
									{tab.id !== 'pending' ? (
										<Button
											type='button'
											variant='ghost'
											size='icon-xs'
											title='关闭标签'
											className='absolute top-1/2 right-1.5 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100'
											onClick={(event) => {
												event.stopPropagation()
												onCloseTab(tab.id)
											}}>
											<XIcon />
										</Button>
									) : null}
								</div>
							)
						})}
					</TabsList>
				</div>
			</Tabs>
			<div className='ml-3 flex shrink-0 items-center'>
				<Button
					type='button'
					variant='ghost'
					size='icon-sm'
					aria-pressed={isRightPanelOpen}
					title={isRightPanelOpen ? '收起右侧栏' : '显示右侧栏'}
					onClick={onToggleRightPanel}>
					{isRightPanelOpen ? <PanelRightClose /> : <PanelRightOpen />}
				</Button>
			</div>
		</div>
	)
}

export default WorkbenchTabs
