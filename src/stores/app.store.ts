import { create } from 'zustand'
import { APP_BOOT_STAGES } from '@/constants'
import type { AppBootStage, AppError } from '@/types'

type AppStoreState = {
	bootStage: AppBootStage
	isAppReady: boolean
	lastError: AppError | null
	setBootStage: (bootStage: AppBootStage) => void
	setAppReady: (isReady: boolean) => void
	setLastError: (error: AppError | null) => void
	reset: () => void
}

const initialAppState = {
	bootStage: APP_BOOT_STAGES.BOOTSTRAPPING,
	isAppReady: false,
	lastError: null,
} satisfies Pick<AppStoreState, 'bootStage' | 'isAppReady' | 'lastError'>

// 应用级 store 只负责全局状态，不承担外部副作用。
export const useAppStore = create<AppStoreState>((set) => ({
	...initialAppState,
	setBootStage: (bootStage) => set({ bootStage }),
	setAppReady: (isAppReady) => set({ isAppReady }),
	setLastError: (lastError) => set({ lastError }),
	reset: () => set(initialAppState),
}))
