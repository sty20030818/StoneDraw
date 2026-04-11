import { useCallback, useEffect } from 'react'
import { PlusIcon, XIcon } from 'lucide-react'
import { Outlet, useNavigate } from 'react-router-dom'
import { WindowChrome, WindowChromeBrandHeader } from '@/app/chrome'
import { WORKBENCH_ACTIVITY_ITEMS } from '@/app/router'
import { APP_ROUTES, buildWorkbenchRoute } from '@/shared/constants/routes'
import { useDocumentStore } from '@/features/documents'
import { useOverlayStore } from '@/features/overlays'
import { useWorkspaceStore } from '@/features/workspace/state'
import { Button } from '@/shared/ui'
import {
	ActivityBar,
	ExplorerPanel,
	HistoryPanel,
	RightPanel,
	StatusBar,
	WORKBENCH_SIDE_PANEL_MAX_WIDTH,
	WORKBENCH_SIDE_PANEL_MIN_WIDTH,
	WorkbenchMetaRail,
	WorkbenchResizableShell,
	WorkbenchShellFrame,
	WorkbenchShellProvider,
	WorkbenchSidePanel,
	WorkbenchTabs,
	useWorkbenchShell,
	useWorkbenchStore,
} from '@/features/workbench'

function WorkbenchShellContent() {
	const navigate = useNavigate()
	const { shellState, setActivePanel } = useWorkbenchShell()
	const documents = useWorkspaceStore((state) => state.documents)
	const setSelectedDocumentId = useDocumentStore((state) => state.setSelectedDocumentId)
	const openNewDocumentDialog = useOverlayStore((state) => state.openNewDocumentDialog)
	const activeDocumentId = useWorkbenchStore((state) => state.activeDocumentId)
	const documentTitle = useWorkbenchStore((state) => state.documentTitle)
	const isWorkbenchReady = useWorkbenchStore((state) => state.isWorkbenchReady)
	const saveStatus = useWorkbenchStore((state) => state.saveStatus)
	const activePanel = useWorkbenchStore((state) => state.activePanel)
	const sidePanelWidth = useWorkbenchStore((state) => state.sidePanelWidth)
	const tabs = useWorkbenchStore((state) => state.tabs)
	const activeTabId = useWorkbenchStore((state) => state.activeTabId)
	const isSidePanelOpen = useWorkbenchStore((state) => state.isSidePanelOpen)
	const isRightPanelOpen = useWorkbenchStore((state) => state.isRightPanelOpen)
	const setSidePanelWidth = useWorkbenchStore((state) => state.setSidePanelWidth)
	const rehydrateSidePanelWidth = useWorkbenchStore((state) => state.rehydrateSidePanelWidth)
	const setSidePanelOpen = useWorkbenchStore((state) => state.setSidePanelOpen)
	const setRightPanelOpen = useWorkbenchStore((state) => state.setRightPanelOpen)
	const activateDocumentTab = useWorkbenchStore((state) => state.activateDocumentTab)
	const closeDocumentTab = useWorkbenchStore((state) => state.closeDocumentTab)
	const activeItem = WORKBENCH_ACTIVITY_ITEMS.find((item) => item.key === activePanel) ?? WORKBENCH_ACTIVITY_ITEMS[0]
	const brandHeaderWidthClass = 'w-[19.5rem]'

	useEffect(() => {
		rehydrateSidePanelWidth()
	}, [rehydrateSidePanelWidth])

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

	const handlePanelChange = useCallback(
		(panel: typeof activePanel) => {
			if (panel === activePanel) {
				setSidePanelOpen(!isSidePanelOpen)
				return
			}

			setActivePanel(panel)
			setSidePanelOpen(true)
		},
		[activePanel, isSidePanelOpen, setActivePanel, setSidePanelOpen],
	)

	function renderSidePanel() {
		switch (activePanel) {
			case 'history':
				return (
					<HistoryPanel
						documentId={activeDocumentId}
						isDocumentReady={isWorkbenchReady}
						onCreateVersion={shellState.onCreateVersion}
					/>
				)
			case 'explorer':
			default:
				return (
					<ExplorerPanel
						documents={documents}
						activeDocumentId={activeDocumentId}
						onSelectDocument={openDocumentInWorkbench}
					/>
				)
		}
	}

	const workbenchFrame = (
		<WorkbenchShellFrame
			header={
				<WorkbenchTabs
					tabs={tabs}
					activeTabId={activeTabId}
					fallbackDocumentId={activeDocumentId}
					fallbackDocumentTitle={documentTitle}
					isDocumentReady={isWorkbenchReady}
					activeSaveStatus={saveStatus}
					isRightPanelOpen={isRightPanelOpen}
					onSelectTab={openDocumentInWorkbench}
					onCloseTab={handleCloseTab}
					onToggleRightPanel={() => {
						setRightPanelOpen(!isRightPanelOpen)
					}}
				/>
			}
			canvas={<Outlet />}
			metaRail={
				isRightPanelOpen ? (
					<WorkbenchMetaRail
						title='文档元信息'
						actions={
							<Button
								type='button'
								variant='ghost'
								size='icon-sm'
								title='收起右侧栏'
								onClick={() => {
									setRightPanelOpen(false)
								}}>
								<XIcon />
							</Button>
						}>
						<RightPanel
							documentId={activeDocumentId}
							documentTitle={documentTitle}
							isDocumentReady={isWorkbenchReady}
							saveStatus={saveStatus}
						/>
					</WorkbenchMetaRail>
				) : null
			}
		/>
	)

	return (
		<section className='flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background'>
			<div className='flex shrink-0'>
				<WindowChromeBrandHeader
					className={`${brandHeaderWidthClass} shrink-0`}
					showBottomBorder
				/>
				<WindowChrome
					scene='workbench'
					className='flex-1'
					pageCenterOffset='9.75rem'
				/>
			</div>
			<div className='flex min-h-0 flex-1 overflow-hidden'>
				<ActivityBar
					activePanel={activePanel}
					onBack={shellState.onBack}
					onPanelChange={handlePanelChange}
					showRightBorder
					highlightActive={isSidePanelOpen}
				/>
				<WorkbenchResizableShell
					isSidePanelOpen={isSidePanelOpen}
					sidePanelWidth={sidePanelWidth}
					minSidePanelWidth={WORKBENCH_SIDE_PANEL_MIN_WIDTH}
					maxSidePanelWidth={WORKBENCH_SIDE_PANEL_MAX_WIDTH}
					onSidePanelWidthCommit={setSidePanelWidth}
					sidebar={
						<div
							className='flex h-full min-w-0 overflow-hidden bg-card'
							data-sidebar-open={isSidePanelOpen ? 'true' : 'false'}>
							{isSidePanelOpen ? (
								<WorkbenchSidePanel
									label={activeItem.label}
									actions={
										activePanel === 'explorer' ? (
											<Button
												type='button'
												variant='ghost'
												size='icon-sm'
												title='新建文档'
												onClick={() => {
													openNewDocumentDialog({
														source: 'workbench-side-panel',
													})
												}}>
												<PlusIcon />
											</Button>
										) : null
									}>
									{renderSidePanel()}
								</WorkbenchSidePanel>
							) : null}
						</div>
					}
					main={workbenchFrame}
				/>
			</div>
			<div className='min-w-0'>
				<StatusBar
					activePanel={activePanel}
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
