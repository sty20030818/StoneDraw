import { Outlet } from 'react-router-dom'
import { WindowChrome } from '@/app/chrome'
import { WORKBENCH_ACTIVITY_ITEMS } from '@/app/router'
import {
	ActivityBar,
	ExplorerPanel,
	HistoryPanel,
	LibraryPanel,
	RightPanel,
	SearchPanel,
	StatusBar,
	TeamPanel,
	WorkbenchShellProvider,
	WorkbenchTabs,
	WorkbenchTitleBar,
	useWorkbenchShell,
} from '@/workbench'
import { useWorkbenchStore } from '@/stores/workbench.store'

function WorkbenchShellContent() {
	const { shellState, setActivePanel } = useWorkbenchShell()
	const tabs = useWorkbenchStore((state) => state.tabs)
	const activeTabId = useWorkbenchStore((state) => state.activeTabId)
	const isSidePanelOpen = useWorkbenchStore((state) => state.isSidePanelOpen)
	const isRightPanelOpen = useWorkbenchStore((state) => state.isRightPanelOpen)
	const activeItem = WORKBENCH_ACTIVITY_ITEMS.find((item) => item.key === shellState.activePanel) ?? WORKBENCH_ACTIVITY_ITEMS[0]
	const shellGridClass = isSidePanelOpen
		? isRightPanelOpen
			? 'grid-cols-[3.5rem_17rem_minmax(0,1fr)_18rem]'
			: 'grid-cols-[3.5rem_17rem_minmax(0,1fr)_0rem]'
		: isRightPanelOpen
			? 'grid-cols-[3.5rem_0rem_minmax(0,1fr)_18rem]'
			: 'grid-cols-[3.5rem_0rem_minmax(0,1fr)_0rem]'

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
		<section
			className={[
				'grid h-full min-h-0 flex-1 overflow-hidden bg-[linear-gradient(180deg,rgba(244,247,252,0.72),rgba(233,239,248,0.9))]',
				shellGridClass,
				'grid-rows-[2.75rem_2.625rem_4rem_minmax(0,1fr)_2rem]',
			].join(' ')}>
			<div className='row-span-5'>
				<ActivityBar
					activePanel={shellState.activePanel}
					onPanelChange={setActivePanel}
				/>
			</div>

			{isSidePanelOpen ? (
				<aside className='row-span-5 flex min-h-0 flex-col border-r border-border/60 bg-[rgba(250,251,255,0.9)]'>
					<div
						data-tauri-drag-region
						className='flex h-[42px] items-center justify-between border-b border-border/60 px-4'>
						<p className='text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground'>{activeItem.label}</p>
						<span className='tauri-no-drag text-sm text-muted-foreground'>＋</span>
					</div>
					<div className='px-4 pt-3 text-sm text-muted-foreground'>{activeItem.description}</div>
					<div className='min-h-0 flex-1 overflow-auto px-3 py-3'>{renderSidePanel()}</div>
				</aside>
			) : null}

			<div className='col-start-3 col-span-2 row-start-1 min-w-0'>
				<WindowChrome />
			</div>
			<div className='col-start-3 col-span-2 row-start-2 min-w-0'>
				<WorkbenchTabs
					tabs={tabs}
					activeTabId={activeTabId}
					fallbackDocumentId={shellState.documentId}
					fallbackDocumentTitle={shellState.documentTitle}
					isDocumentReady={shellState.isDocumentReady}
				/>
			</div>
			<div className='col-start-3 col-span-2 row-start-3 min-w-0'>
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
			</div>

			<div className='col-start-3 row-start-4 min-h-0 overflow-auto bg-[radial-gradient(circle_at_center,rgba(27,77,255,0.08),transparent_34%)]'>
				<div className='min-h-0 h-full overflow-auto bg-[radial-gradient(rgba(80,101,141,0.14)_1px,transparent_1px)] [background-size:22px_22px]'>
					<Outlet />
				</div>
			</div>
			<div className='col-start-3 col-span-2 row-start-5 min-w-0'>
				<StatusBar
					activePanel={shellState.activePanel}
					documentId={shellState.documentId}
					isDocumentReady={shellState.isDocumentReady}
					saveStatus={shellState.saveStatus}
				/>
			</div>

			{isRightPanelOpen ? (
				<div className='col-start-4 row-start-3 row-span-2 min-h-0'>
					<RightPanel
						documentId={shellState.documentId}
						documentTitle={shellState.documentTitle}
						isDocumentReady={shellState.isDocumentReady}
						saveStatus={shellState.saveStatus}
					/>
				</div>
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
