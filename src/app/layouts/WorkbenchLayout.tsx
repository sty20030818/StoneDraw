import { useCallback } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { WindowChrome } from '@/app/chrome'
import { WORKBENCH_ACTIVITY_ITEMS } from '@/app/router'
import { APP_ROUTES, buildWorkbenchRoute } from '@/shared/constants/routes'
import { useDocumentStore } from '@/features/documents'
import { useWorkspaceStore } from '@/features/workspace/state'
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
	const documents = useWorkspaceStore((state) => state.documents)
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
	const setRightPanelOpen = useWorkbenchStore((state) => state.setRightPanelOpen)
	const activateDocumentTab = useWorkbenchStore((state) => state.activateDocumentTab)
	const closeDocumentTab = useWorkbenchStore((state) => state.closeDocumentTab)
	const activeItem = WORKBENCH_ACTIVITY_ITEMS.find((item) => item.key === activePanel) ?? WORKBENCH_ACTIVITY_ITEMS[0]

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
		<section className='flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background'>
			<WindowChrome />
			<div className='flex min-h-0 flex-1 overflow-hidden'>
				<div className='flex min-h-0 shrink-0 border-r bg-card'>
					<ActivityBar
						activePanel={activePanel}
						onPanelChange={setActivePanel}
					/>
					{isSidePanelOpen ? (
						<aside className='flex min-h-0 w-72 flex-col border-l bg-card'>
							<div
								data-tauri-drag-region
								className='flex h-12 items-center border-b px-4'>
								<p className='text-xs font-medium uppercase text-muted-foreground'>
									{activeItem.label}
								</p>
							</div>
							<div className='px-4 pt-3 text-sm text-muted-foreground'>{activeItem.description}</div>
							<div className='min-h-0 flex-1 overflow-auto px-3 py-3'>{renderSidePanel()}</div>
						</aside>
					) : null}
				</div>

				<div className='flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-muted/20'>
					<WorkbenchTabs
						tabs={tabs}
						activeTabId={activeTabId}
						fallbackDocumentId={activeDocumentId}
						fallbackDocumentTitle={documentTitle}
						isDocumentReady={isWorkbenchReady}
						onSelectTab={openDocumentInWorkbench}
						onCloseTab={handleCloseTab}
					/>
					<WorkbenchTitleBar
						documentTitle={documentTitle}
						isDocumentReady={isWorkbenchReady}
						saveStatus={saveStatus}
						isFlushing={isFlushing}
						isRightPanelOpen={isRightPanelOpen}
						onBack={shellState.onBack}
						onSave={shellState.onSave}
						onToggleRightPanel={() => {
							setRightPanelOpen(!isRightPanelOpen)
						}}
					/>
					<div className='min-h-0 flex-1 overflow-hidden px-3 py-3'>
						<Outlet />
					</div>
				</div>

				{isRightPanelOpen ? (
					<div className='flex min-h-0 w-80 shrink-0 border-l bg-card'>
						<RightPanel
							documentId={activeDocumentId}
							documentTitle={documentTitle}
							isDocumentReady={isWorkbenchReady}
							saveStatus={saveStatus}
							onClose={() => {
								setRightPanelOpen(false)
							}}
						/>
					</div>
				) : null}
			</div>
			<div className='min-w-0'>
				<StatusBar
					activePanel={activePanel}
					documentId={activeDocumentId}
					isDocumentReady={isWorkbenchReady}
					isRightPanelOpen={isRightPanelOpen}
					saveStatus={saveStatus}
				/>
			</div>
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
