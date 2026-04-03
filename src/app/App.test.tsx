import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { APP_BOOT_STAGES } from '@/constants'
import { createDatabaseHealthPayload, createLocalDirectoriesPayload } from '@/test/fixtures/app'
import { createDeferredPromise } from '@/test/helpers/deferred'
import { useAppStore } from '@/stores/app.store'
import type { TauriCommandResult } from '@/types'
import type { DatabaseHealthPayload, LocalDirectoriesPayload, SystemDemoPayload } from '@/types'

const {
	prepareLocalDirectoriesMock,
	initializeDatabaseMock,
	runDemoMock,
} = vi.hoisted(() => ({
	prepareLocalDirectoriesMock: vi.fn<() => Promise<TauriCommandResult<LocalDirectoriesPayload>>>(),
	initializeDatabaseMock: vi.fn<() => Promise<TauriCommandResult<DatabaseHealthPayload>>>(),
	runDemoMock: vi.fn<() => Promise<TauriCommandResult<SystemDemoPayload>>>(),
}))

vi.mock('@/services', () => ({
	directoryService: {
		prepareLocalDirectories: prepareLocalDirectoriesMock,
	},
	databaseService: {
		initializeDatabase: initializeDatabaseMock,
	},
	systemService: {
		runDemo: runDemoMock,
	},
}))

vi.mock('@/app/AppRouter', () => ({
	default: () => <div>应用路由已就绪</div>,
}))

vi.mock('@/components/feedback/AppToaster', () => ({
	default: () => <div>Toast 容器</div>,
}))

describe('App', () => {
	beforeEach(() => {
		prepareLocalDirectoriesMock.mockReset()
		initializeDatabaseMock.mockReset()
		runDemoMock.mockReset()
		useAppStore.getState().reset()

		runDemoMock.mockResolvedValue({
			ok: true,
			data: {
				commandName: 'system_demo',
				runtime: 'test',
				bridgeReady: true,
				respondedAt: new Date().toISOString(),
			},
		})
	})

	test('启动成功时应先展示 loading 再进入 ready', async () => {
		const directoryDeferred = createDeferredPromise<TauriCommandResult<LocalDirectoriesPayload>>()
		const databaseDeferred = createDeferredPromise<TauriCommandResult<DatabaseHealthPayload>>()
		prepareLocalDirectoriesMock.mockReturnValueOnce(directoryDeferred.promise)
		initializeDatabaseMock.mockReturnValueOnce(databaseDeferred.promise)

		const { default: App } = await import('./App')
		render(<App />)

		expect(screen.getByText('正在启动应用外壳')).toBeInTheDocument()

		directoryDeferred.resolve({
			ok: true,
			data: createLocalDirectoriesPayload(),
		})
		databaseDeferred.resolve({
			ok: true,
			data: createDatabaseHealthPayload(),
		})

		expect(await screen.findByText('应用路由已就绪')).toBeInTheDocument()
		expect(runDemoMock).toHaveBeenCalledTimes(1)
		expect(useAppStore.getState()).toMatchObject({
			bootStage: APP_BOOT_STAGES.READY,
			isAppReady: true,
			localDirectoryStatus: 'ready',
			databaseStatus: 'ready',
		})
	})

	test('数据库初始化失败时也应完成应用启动并标记错误状态', async () => {
		prepareLocalDirectoriesMock.mockResolvedValueOnce({
			ok: true,
			data: createLocalDirectoriesPayload(),
		})
		initializeDatabaseMock.mockResolvedValueOnce({
			ok: false,
			error: {
				code: 'DB_ERROR',
				message: '数据库初始化失败',
			},
		})

		const { default: App } = await import('./App')
		render(<App />)

		expect(await screen.findByText('应用路由已就绪')).toBeInTheDocument()
		expect(runDemoMock).not.toHaveBeenCalled()
		expect(useAppStore.getState()).toMatchObject({
			bootStage: APP_BOOT_STAGES.READY,
			isAppReady: true,
			localDirectoryStatus: 'ready',
			databaseStatus: 'error',
		})
	})

	test('目录初始化失败时应跳过数据库初始化并进入 ready', async () => {
		prepareLocalDirectoriesMock.mockResolvedValueOnce({
			ok: false,
			error: {
				code: 'IO_ERROR',
				message: '目录初始化失败',
			},
		})

		const { default: App } = await import('./App')
		render(<App />)

		expect(await screen.findByText('应用路由已就绪')).toBeInTheDocument()
		await waitFor(() => {
			expect(initializeDatabaseMock).not.toHaveBeenCalled()
		})
		expect(useAppStore.getState()).toMatchObject({
			bootStage: APP_BOOT_STAGES.READY,
			isAppReady: true,
			localDirectoryStatus: 'error',
			databaseStatus: 'error',
		})
	})
})
