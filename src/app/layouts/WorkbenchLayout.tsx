import { Outlet } from 'react-router-dom'
import { WORKBENCH_ACTIVITY_ITEMS } from '@/app/router'
import {
	ActivityBar,
	RightPanel,
	StatusBar,
	WorkbenchShellProvider,
	WorkbenchTabs,
	WorkbenchTitleBar,
	useWorkbenchShell,
} from '@/components/workbench'
import {
	ExplorerPanel,
	HistoryPanel,
	LibraryPanel,
	SearchPanel,
	TeamPanel,
} from '@/components/panels'
import { useWorkbenchStore } from '@/stores/workbench.store'

function WorkbenchShellContent() {
	const { shellState, setActivePanel } = useWorkbenchShell()
	const tabs = useWorkbenchStore((state) => state.tabs)
	const activeTabId = useWorkbenchStore((state) => state.activeTabId)
	const isSidePanelOpen = useWorkbenchStore((state) => state.isSidePanelOpen)
	const isRightPanelOpen = useWorkbenchStore((state) => state.isRightPanelOpen)
	const activeItem = WORKBENCH_ACTIVITY_ITEMS.find((item) => item.key === shellState.activePanel) ?? WORKBENCH_ACTIVITY_ITEMS[0]

	function renderSidePanel() {
		switch (shellState.activePanel) {
			case 'search':
				return <SearchPanel searchDraft={shellState.searchDraft} />
			case 'library':
				return <LibraryPanel />
			case 'history':
				return <HistoryPanel saveStatus={shellState.saveStatus} />
			case 'team':
				return <TeamPanel />
			case 'explorer':
			default:
				return (
					<ExplorerPanel
						documentId={shellState.documentId}
						documentTitle={shellState.documentTitle}
					/>
				)
		}
	}

	return (
		<section className='flex h-full min-h-0 flex-1 overflow-hidden rounded-[1.75rem] border border-border/70 bg-background/82 shadow-sm backdrop-blur'>
			<ActivityBar
				activePanel={shellState.activePanel}
				onPanelChange={setActivePanel}
			/>

			{isSidePanelOpen ? (
				<aside className='flex w-72 shrink-0 flex-col border-r border-border/70 bg-card/72 p-4'>
					<p className='text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground'>Side Panel</p>
					<h2 className='mt-2 text-base font-semibold tracking-tight'>{activeItem.label}</h2>
					<p className='mt-2 text-sm leading-6 text-muted-foreground'>{activeItem.description}</p>
					<div className='mt-4 min-h-0 flex-1 overflow-auto'>{renderSidePanel()}</div>
				</aside>
			) : null}

			<div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
				<WorkbenchTabs
					tabs={tabs}
					activeTabId={activeTabId}
					fallbackDocumentId={shellState.documentId}
					fallbackDocumentTitle={shellState.documentTitle}
					isDocumentReady={shellState.isDocumentReady}
				/>
				<WorkbenchTitleBar
					documentTitle={shellState.documentTitle}
					searchDraft={shellState.searchDraft}
					isDocumentReady={shellState.isDocumentReady}
					saveStatus={shellState.saveStatus}
					isFlushing={shellState.isFlushing}
					onBack={shellState.onBack}
					onSave={shellState.onSave}
					onExport={shellState.onExport}
					onMore={shellState.onMore}
					onSearchChange={shellState.onSearchChange}
				/>

				<div className='min-h-0 flex-1 overflow-auto bg-background/58 p-5'>
					<Outlet />
				</div>

				<StatusBar
					activePanel={shellState.activePanel}
					documentId={shellState.documentId}
					isDocumentReady={shellState.isDocumentReady}
					saveStatus={shellState.saveStatus}
				/>
			</div>

			{isRightPanelOpen ? (
				<RightPanel
					documentId={shellState.documentId}
					documentTitle={shellState.documentTitle}
					isDocumentReady={shellState.isDocumentReady}
					saveStatus={shellState.saveStatus}
				/>
			) : null}
		</section>
	)
}

function WorkbenchLayout() {
	return (
		<WorkbenchShellProvider>
			<WorkbenchShellContent />
		</WorkbenchShellProvider>
	)
}

export default WorkbenchLayout
