import { beforeEach, describe, expect, test } from 'vitest'
import { APP_BOOT_STAGES } from '@/shared/constants'
import { createDatabaseHealthPayload, createLocalDirectoriesPayload } from '@/test/fixtures/app'
import { createAppError } from '@/test/fixtures/error'
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

	test('命令成功与失败上报应更新桥接状态和错误对象', () => {
		const appStore = useAppStore.getState()

		appStore.reportCommandSuccess('documents_list')

		expect(useAppStore.getState()).toMatchObject({
			commandBridgeStatus: 'ready',
			lastCommandName: 'documents_list',
		})

		appStore.reportCommandError('documents_open', {
			...createAppError({
				code: 'IO_ERROR',
				message: '打开失败',
				module: 'document-repository',
				operation: 'open',
			}),
		})

		expect(useAppStore.getState()).toMatchObject({
			commandBridgeStatus: 'error',
			lastError: {
				code: 'IO_ERROR',
				message: '打开失败',
				command: 'documents_open',
			},
		})
		expect(useAppStore.getState().lastCommandAt).not.toBeNull()
	})

	test('首次命令就是错误时应进入 error 状态', () => {
		const appStore = useAppStore.getState()

		appStore.reportCommandError('documents_open', {
			...createAppError({
				code: 'NOT_FOUND',
				message: '文档不存在',
				module: 'document-repository',
				operation: 'open',
			}),
		})

		expect(useAppStore.getState()).toMatchObject({
			commandBridgeStatus: 'error',
			lastError: {
				code: 'NOT_FOUND',
				command: 'documents_open',
			},
		})
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
			commandBridgeStatus: 'idle',
			localDirectoryStatus: 'idle',
			databaseStatus: 'idle',
			lastError: null,
		})
	})
})
