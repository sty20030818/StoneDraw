import { create } from 'zustand'
import { APP_BOOT_STAGES } from '@/shared/constants'
import type { AppSceneKey } from '@/shared/constants/routes'
import { toIsoString } from '@/shared/lib'
import type {
	AppBootStage,
	AppError,
	BootstrapHealthSnapshot,
	CommandBridgeStatus,
	DatabaseHealthPayload,
	DatabaseStatus,
	LocalDirectoriesPayload,
	LocalDirectoryStatus,
} from '@/shared/types'

type AppStoreState = {
	bootStage: AppBootStage
	isAppReady: boolean
	lastError: AppError | null
	bootstrapError: AppError | null
	bootstrapSnapshot: BootstrapHealthSnapshot | null
	commandBridgeStatus: CommandBridgeStatus
	localDirectoryStatus: LocalDirectoryStatus
	localDirectories: LocalDirectoriesPayload | null
	localDirectoriesReadyAt: string | null
	databaseStatus: DatabaseStatus
	databaseHealth: DatabaseHealthPayload | null
	databaseReadyAt: string | null
	lastCommandName: string | null
	lastCommandAt: string | null
	activeSceneKey: AppSceneKey
	activeRoutePath: string | null
	setBootStage: (bootStage: AppBootStage) => void
	setAppReady: (isReady: boolean) => void
	setActiveScene: (sceneKey: AppSceneKey, pathname: string) => void
	setLastError: (error: AppError | null) => void
	setBootstrapFailure: (payload: { error: AppError; snapshot: BootstrapHealthSnapshot }) => void
	setBootstrapReady: (snapshot: BootstrapHealthSnapshot) => void
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
	bootstrapError: null,
	bootstrapSnapshot: null,
	commandBridgeStatus: 'idle' as CommandBridgeStatus,
	localDirectoryStatus: 'idle' as LocalDirectoryStatus,
	localDirectories: null,
	localDirectoriesReadyAt: null,
	databaseStatus: 'idle' as DatabaseStatus,
	databaseHealth: null,
	databaseReadyAt: null,
	lastCommandName: null,
	lastCommandAt: null,
	activeSceneKey: 'workspace' as AppSceneKey,
	activeRoutePath: null,
} satisfies Pick<
	AppStoreState,
	| 'bootStage'
	| 'isAppReady'
	| 'lastError'
	| 'bootstrapError'
	| 'bootstrapSnapshot'
	| 'commandBridgeStatus'
	| 'localDirectoryStatus'
	| 'localDirectories'
	| 'localDirectoriesReadyAt'
	| 'databaseStatus'
	| 'databaseHealth'
	| 'databaseReadyAt'
	| 'lastCommandName'
	| 'lastCommandAt'
	| 'activeSceneKey'
	| 'activeRoutePath'
>

// 应用级 store 只负责全局状态，不承担外部副作用。
export const useAppStore = create<AppStoreState>((set) => ({
	...initialAppState,
	setBootStage: (bootStage) => set({ bootStage }),
	setAppReady: (isAppReady) => set({ isAppReady }),
	setActiveScene: (activeSceneKey, activeRoutePath) => set({ activeSceneKey, activeRoutePath }),
	setLastError: (lastError) => set({ lastError }),
	setBootstrapFailure: ({ error, snapshot }) =>
		set({
			bootStage: APP_BOOT_STAGES.FAILED,
			isAppReady: false,
			bootstrapError: error,
			bootstrapSnapshot: snapshot,
			lastError: error,
		}),
	setBootstrapReady: (bootstrapSnapshot) =>
		set({
			bootStage: APP_BOOT_STAGES.READY,
			isAppReady: true,
			bootstrapError: null,
			bootstrapSnapshot,
		}),
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
		set({
			commandBridgeStatus: 'error',
			lastCommandAt: toIsoString(),
			lastError: {
				...error,
				command: error.command ?? commandName,
			},
		}),
	reset: () => set(initialAppState),
}))
