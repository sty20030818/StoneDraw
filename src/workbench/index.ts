export { default as ActivityBar } from './ActivityBar'
export { default as CanvasShell } from './CanvasShell'
export { default as RightPanel } from './RightPanel'
export { default as StatusBar } from './StatusBar'
export { default as WorkbenchTabs } from './WorkbenchTabs'
export { default as WorkbenchTitleBar } from './WorkbenchTitleBar'
export { WorkbenchShellProvider, useWorkbenchShell } from './WorkbenchShellBridge'
export type { WorkbenchShellState } from './WorkbenchShellBridge'
export {
	ExplorerPanel,
	HistoryPanel,
	LibraryPanel,
	SearchPanel,
	TeamPanel,
} from '@/components/panels'
export type { WorkbenchPanelKey } from '@/stores/workbench.store'
