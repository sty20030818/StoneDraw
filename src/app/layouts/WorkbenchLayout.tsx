import { useCallback } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { WindowChrome } from '@/app/chrome'
import { WORKBENCH_ACTIVITY_ITEMS } from '@/app/router'
import { APP_ROUTES, buildWorkbenchRoute } from '@/shared/constants/routes'
import { useDocumentStore } from '@/features/documents'
import {
	ActivityBar,
	ExplorerPanel,
	HistoryPanel,
	RightPanel,
	StatusBar,
	WorkbenchShellProvider,
	WorkbenchTabs,
	WorkbenchTitleBar,
	useWorkbenchShell,
	useWorkbenchStore,
} from '@/features/workbench'

function WorkbenchShellContent() {
	const navigate = useNavigate()
	const { shellState, setActivePanel } = useWorkbenchShell()
	const documents = useDocumentStore((state) => state.documents)
	const setSelectedDocumentId = useDocumentStore((state) => state.setSelectedDocumentId)
	const activeDocumentId = useWorkbenchStore((state) => state.activeDocumentId)
	const documentTitle = useWorkbenchStore((state) => state.documentTitle)
	const isWorkbenchReady = useWorkbenchStore((state) => state.isWorkbenchReady)
	const saveStatus = useWorkbenchStore((state) => state.saveStatus)
	const isFlushing = useWorkbenchStore((state) => state.isFlushing)
	const activePanel = useWorkbenchStore((state) => state.activePanel)
	const tabs = useWorkbenchStore((state) => state.tabs)
	const activeTabId = useWorkbenchStore((state) => state.activeTabId)
	const isSidePanelOpen = useWorkbenchStore((state) => state.isSidePanelOpen)
	const isRightPanelOpen = useWorkbenchStore((state) => state.isRightPanelOpen)
	const activateDocumentTab = useWorkbenchStore((state) => state.activateDocumentTab)
	const closeDocumentTab = useWorkbenchStore((state) => state.closeDocumentTab)
	const activeItem = WORKBENCH_ACTIVITY_ITEMS.find((item) => item.key === activePanel) ?? WORKBENCH_ACTIVITY_ITEMS[0]
	const shellGridClass = isSidePanelOpen
		? isRightPanelOpen
			? 'grid-cols-[3.5rem_17rem_minmax(0,1fr)_18rem]'
			: 'grid-cols-[3.5rem_17rem_minmax(0,1fr)_0rem]'
		: isRightPanelOpen
			? 'grid-cols-[3.5rem_0rem_minmax(0,1fr)_18rem]'
			: 'grid-cols-[3.5rem_0rem_minmax(0,1fr)_0rem]'

	const openDocumentInWorkbench = useCallback(
		(documentId: string) => {
			activateDocumentTab(documentId)
			setSelectedDocumentId(documentId)
			navigate(buildWorkbenchRoute(documentId))
		},
		[activateDocumentTab, navigate, setSelectedDocumentId],
	)

	const handleCloseTab = useCallback(
		(documentId: string) => {
			const nextDocumentId = closeDocumentTab(documentId)

			if (activeDocumentId !== documentId) {
				return
			}

			setSelectedDocumentId(nextDocumentId)

			if (nextDocumentId) {
				navigate(buildWorkbenchRoute(nextDocumentId))
				return
			}

			navigate(APP_ROUTES.WORKSPACE_HOME)
		},
		[activeDocumentId, closeDocumentTab, navigate, setSelectedDocumentId],
	)

	function renderSidePanel() {
		switch (activePanel) {
			case 'history':
				return (
					<HistoryPanel
						documentId={activeDocumentId}
						documentTitle={documentTitle}
						isDocumentReady={isWorkbenchReady}
						saveStatus={saveStatus}
						onCreateVersion={shellState.onCreateVersion}
					/>
				)
			case 'explorer':
			default:
				return (
					<ExplorerPanel
						documents={documents}
						activeDocumentId={activeDocumentId}
						documentId={activeDocumentId}
						documentTitle={documentTitle}
						onSelectDocument={openDocumentInWorkbench}
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
					activePanel={activePanel}
					onPanelChange={setActivePanel}
				/>
			</div>

			{isSidePanelOpen ? (
				<aside className='row-span-5 flex min-h-0 flex-col border-r border-border/60 bg-[rgba(250,251,255,0.9)]'>
					<div
						data-tauri-drag-region
						className='flex h-[42px] items-center border-b border-border/60 px-4'>
						<p className='text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground'>
							{activeItem.label}
						</p>
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
					fallbackDocumentId={activeDocumentId}
					fallbackDocumentTitle={documentTitle}
					isDocumentReady={isWorkbenchReady}
					onSelectTab={openDocumentInWorkbench}
					onCloseTab={handleCloseTab}
				/>
			</div>
			<div className='col-start-3 col-span-2 row-start-3 min-w-0'>
				<WorkbenchTitleBar
					documentTitle={documentTitle}
					isDocumentReady={isWorkbenchReady}
					saveStatus={saveStatus}
					isFlushing={isFlushing}
					onBack={shellState.onBack}
					onSave={shellState.onSave}
					onExport={shellState.onExport}
					onMore={shellState.onMore}
				/>
			</div>

			<div className='col-start-3 row-start-4 min-h-0 overflow-auto bg-[radial-gradient(circle_at_center,rgba(27,77,255,0.08),transparent_34%)]'>
				<div className='min-h-0 h-full overflow-auto bg-[radial-gradient(rgba(80,101,141,0.14)_1px,transparent_1px)] [background-size:22px_22px]'>
					<Outlet />
				</div>
			</div>
			<div className='col-start-3 col-span-2 row-start-5 min-w-0'>
				<StatusBar
					activePanel={activePanel}
					documentId={activeDocumentId}
					isDocumentReady={isWorkbenchReady}
					saveStatus={saveStatus}
				/>
			</div>

			{isRightPanelOpen ? (
				<div className='col-start-4 row-start-3 row-span-2 min-h-0'>
					<RightPanel
						documentId={activeDocumentId}
						documentTitle={documentTitle}
						isDocumentReady={isWorkbenchReady}
						saveStatus={saveStatus}
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
