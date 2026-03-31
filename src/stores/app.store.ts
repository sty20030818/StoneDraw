import { create } from 'zustand'
import { APP_BOOT_STAGES } from '@/constants'
import { toIsoString } from '@/utils'
import type {
	AppBootStage,
	AppError,
	CommandBridgeStatus,
	DatabaseHealthPayload,
	DatabaseStatus,
	LocalDirectoriesPayload,
	LocalDirectoryStatus,
} from '@/types'

type AppStoreState = {
	bootStage: AppBootStage
	isAppReady: boolean
	lastError: AppError | null
	commandBridgeStatus: CommandBridgeStatus
	localDirectoryStatus: LocalDirectoryStatus
	localDirectories: LocalDirectoriesPayload | null
	localDirectoriesReadyAt: string | null
	databaseStatus: DatabaseStatus
	databaseHealth: DatabaseHealthPayload | null
	databaseReadyAt: string | null
	lastCommandName: string | null
	lastCommandAt: string | null
	setBootStage: (bootStage: AppBootStage) => void
	setAppReady: (isReady: boolean) => void
	setLastError: (error: AppError | null) => void
	setLocalDirectoryStatus: (status: LocalDirectoryStatus) => void
	setLocalDirectories: (directories: LocalDirectoriesPayload) => void
	clearLocalDirectories: () => void
	setDatabaseStatus: (status: DatabaseStatus) => void
	setDatabaseHealth: (databaseHealth: DatabaseHealthPayload) => void
	clearDatabaseHealth: () => void
	clearLastError: () => void
	reportCommandSuccess: (commandName: string) => void
	reportCommandError: (commandName: string, error: AppError) => void
	reset: () => void
}

const initialAppState = {
	bootStage: APP_BOOT_STAGES.BOOTSTRAPPING,
	isAppReady: false,
	lastError: null,
	commandBridgeStatus: 'idle' as CommandBridgeStatus,
	localDirectoryStatus: 'idle' as LocalDirectoryStatus,
	localDirectories: null,
	localDirectoriesReadyAt: null,
	databaseStatus: 'idle' as DatabaseStatus,
	databaseHealth: null,
	databaseReadyAt: null,
	lastCommandName: null,
	lastCommandAt: null,
} satisfies Pick<
	AppStoreState,
	| 'bootStage'
	| 'isAppReady'
	| 'lastError'
	| 'commandBridgeStatus'
	| 'localDirectoryStatus'
	| 'localDirectories'
	| 'localDirectoriesReadyAt'
	| 'databaseStatus'
	| 'databaseHealth'
	| 'databaseReadyAt'
	| 'lastCommandName'
	| 'lastCommandAt'
>

// 应用级 store 只负责全局状态，不承担外部副作用。
export const useAppStore = create<AppStoreState>((set) => ({
	...initialAppState,
	setBootStage: (bootStage) => set({ bootStage }),
	setAppReady: (isAppReady) => set({ isAppReady }),
	setLastError: (lastError) => set({ lastError }),
	setLocalDirectoryStatus: (localDirectoryStatus) => set({ localDirectoryStatus }),
	setLocalDirectories: (localDirectories) =>
		set({
			localDirectories,
			localDirectoryStatus: 'ready',
			localDirectoriesReadyAt: toIsoString(),
		}),
	clearLocalDirectories: () =>
		set({
			localDirectories: null,
			localDirectoryStatus: 'idle',
			localDirectoriesReadyAt: null,
		}),
	setDatabaseStatus: (databaseStatus) => set({ databaseStatus }),
	setDatabaseHealth: (databaseHealth) =>
		set({
			databaseHealth,
			databaseStatus: 'ready',
			databaseReadyAt: toIsoString(),
		}),
	clearDatabaseHealth: () =>
		set({
			databaseHealth: null,
			databaseStatus: 'idle',
			databaseReadyAt: null,
		}),
	clearLastError: () => set({ lastError: null }),
	reportCommandSuccess: (commandName) =>
		set({
			commandBridgeStatus: 'ready',
			lastCommandName: commandName,
			lastCommandAt: toIsoString(),
		}),
	reportCommandError: (commandName, error) =>
		set((state) => ({
			commandBridgeStatus: state.lastCommandName ? state.commandBridgeStatus : 'error',
			lastCommandAt: toIsoString(),
			lastError: {
				...error,
				command: error.command ?? commandName,
			},
		})),
	reset: () => set(initialAppState),
}))
