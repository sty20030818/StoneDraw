import type { AppBootStage, SaveStatus } from '@/types'

export const APP_BOOT_STAGES: Record<'BOOTSTRAPPING' | 'READY', AppBootStage> = {
	BOOTSTRAPPING: 'bootstrapping',
	READY: 'ready',
}

export const SAVE_STATUSES: Record<'IDLE' | 'DIRTY' | 'SAVING' | 'SAVED', SaveStatus> = {
	IDLE: 'idle',
	DIRTY: 'dirty',
	SAVING: 'saving',
	SAVED: 'saved',
}

export const APP_STATUS_BADGE = '0.2.0 本地目录阶段'

export const APP_FEATURE_SCOPE = ['~/.stonedraw 根目录', '本地数据目录', '本地配置目录', '目录健康检查'] as const

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
