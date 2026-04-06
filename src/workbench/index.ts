export { default as ActivityBar } from './ActivityBar'
export { default as CanvasShell } from './CanvasShell'
export { default as ExcalidrawHost } from './ExcalidrawHost'
export { default as RightPanel } from './RightPanel'
export { default as StatusBar } from './StatusBar'
export { default as WorkbenchTabs } from './WorkbenchTabs'
export { default as WorkbenchTitleBar } from './WorkbenchTitleBar'
export { WorkbenchShellProvider, useWorkbenchShell, useWorkbenchShellController } from './WorkbenchShellBridge'
export type { WorkbenchShellState } from './WorkbenchShellBridge'
export { normalizeWorkbenchScene } from './scene-restore-bridge'
export {
	ExplorerPanel,
	HistoryPanel,
	LibraryPanel,
	SearchPanel,
	TeamPanel,
} from '@/components/panels'
export type { WorkbenchPanelKey } from '@/stores/workbench.store'
