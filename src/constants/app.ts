import type { AppBootStage, SaveStatus } from '@/types'

export const APP_BOOT_STAGES: Record<'BOOTSTRAPPING' | 'READY', AppBootStage> = {
	BOOTSTRAPPING: 'bootstrapping',
	READY: 'ready',
}

export const SAVE_STATUSES: Record<'IDLE' | 'DIRTY' | 'SAVING' | 'SAVED' | 'ERROR', SaveStatus> = {
	IDLE: 'idle',
	DIRTY: 'dirty',
	SAVING: 'saving',
	SAVED: 'saved',
	ERROR: 'error',
}

export const APP_STATUS_BADGE = '0.2.5 文档工作区阶段'

export const APP_FEATURE_SCOPE = [
	'文档工作区入口',
	'最近打开与回收站',
	'SQLite 元数据层',
	'命令桥接与健康检查',
] as const

export const TECH_STACK_LABELS = [
	'React 19',
	'TypeScript 6',
	'Vite 8',
	'Tauri 2',
	'Bun',
	'Zustand 5',
	'Excalidraw',
	'Tailwind CSS 4',
	'shadcn/ui',
] as const
