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

export const APP_STATUS_BADGE = '0.1.2 工程骨架阶段'

export const APP_FEATURE_SCOPE = ['目录结构', '共享类型', '状态管理', 'Service 骨架'] as const

export const TECH_STACK_LABELS = ['React 19', 'TypeScript 6', 'Vite 8', 'Tauri 2', 'Bun', 'Zustand 5'] as const
