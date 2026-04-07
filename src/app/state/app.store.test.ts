import { beforeEach, describe, expect, test } from 'vitest'
import { APP_BOOT_STAGES } from '@/shared/constants'
import { createDatabaseHealthPayload, createLocalDirectoriesPayload } from '@/test/fixtures/app'
import { useAppStore } from './app.store'

describe('app.store', () => {
	beforeEach(() => {
		useAppStore.getState().reset()
	})

	test('目录与数据库成功写入时应更新 ready 状态和时间戳', () => {
		const appStore = useAppStore.getState()
		const directories = createLocalDirectoriesPayload()
		const databaseHealth = createDatabaseHealthPayload()

		appStore.setLocalDirectories(directories)
		appStore.setDatabaseHealth(databaseHealth)

		expect(useAppStore.getState()).toMatchObject({
			localDirectories: directories,
			localDirectoryStatus: 'ready',
			databaseHealth,
			databaseStatus: 'ready',
		})
		expect(useAppStore.getState().localDirectoriesReadyAt).not.toBeNull()
		expect(useAppStore.getState().databaseReadyAt).not.toBeNull()
	})

	test('reset 应恢复应用启动初始值', () => {
		const appStore = useAppStore.getState()

		appStore.setBootStage(APP_BOOT_STAGES.READY)
		appStore.setAppReady(true)
		appStore.setLocalDirectoryStatus('error')
		appStore.setDatabaseStatus('error')
		appStore.reset()

		expect(useAppStore.getState()).toMatchObject({
			bootStage: APP_BOOT_STAGES.BOOTSTRAPPING,
			isAppReady: false,
			localDirectoryStatus: 'idle',
			databaseStatus: 'idle',
			lastError: null,
		})
	})
})
