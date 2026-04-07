import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { APP_BOOT_STAGES } from '@/shared/constants'
import { createDatabaseHealthPayload, createLocalDirectoriesPayload } from '@/test/fixtures/app'
import { createAppError } from '@/test/fixtures/error'
import { createDeferredPromise } from '@/test/helpers/deferred'
import { useAppStore } from '@/app/state'
import type { BootstrapRuntimeResult } from '@/shared/types'

const { runBootstrapRuntimeMock } = vi.hoisted(() => ({
	runBootstrapRuntimeMock: vi.fn<() => Promise<BootstrapRuntimeResult>>(),
}))

vi.mock('@/app/bootstrap', () => ({
	runBootstrapRuntime: runBootstrapRuntimeMock,
}))

vi.mock('@/app/AppRouter', () => ({
	default: () => <div>应用路由已就绪</div>,
}))

vi.mock('@/shared/components/AppToaster', () => ({
	default: () => <div>Toast 容器</div>,
}))

vi.mock('@/app/chrome', () => ({
	WindowChrome: () => <div>窗口标题栏</div>,
}))

describe('App', () => {
	beforeEach(() => {
		runBootstrapRuntimeMock.mockReset()
		useAppStore.getState().reset()
	})

	test('启动成功时应先展示 loading 再进入 ready', async () => {
		const bootstrapDeferred = createDeferredPromise<BootstrapRuntimeResult>()
		runBootstrapRuntimeMock.mockReturnValueOnce(bootstrapDeferred.promise)

		const { default: App } = await import('./App')
		render(<App />)

		expect(screen.getByText('正在启动应用外壳')).toBeInTheDocument()

		bootstrapDeferred.resolve({
			ok: true,
			data: {
				localDirectories: createLocalDirectoriesPayload(),
				databaseHealth: createDatabaseHealthPayload(),
				snapshot: {
					correlationId: 'boot-1',
					startedAt: new Date().toISOString(),
					finishedAt: new Date().toISOString(),
					localDirectoriesStatus: 'ready',
					databaseStatus: 'ready',
					databaseFileName: 'app.db',
					databasePath: '/tmp/.stonedraw/data/db/app.db',
				},
			},
		})

		expect(await screen.findByText('应用路由已就绪')).toBeInTheDocument()
		expect(useAppStore.getState()).toMatchObject({
			bootStage: APP_BOOT_STAGES.READY,
			isAppReady: true,
			localDirectoryStatus: 'ready',
			databaseStatus: 'ready',
		})
	})

	test('启动失败时应进入 failed 状态并展示错误页', async () => {
		runBootstrapRuntimeMock.mockResolvedValueOnce({
			ok: false,
			error: {
				error: createAppError({
					code: 'DB_ERROR',
					message: '数据库初始化失败',
					layer: 'bootstrap',
					module: 'bootstrap-runtime',
					operation: 'initializeDatabase',
					correlationId: 'boot-2',
				}),
				snapshot: {
					correlationId: 'boot-2',
					startedAt: new Date().toISOString(),
					finishedAt: new Date().toISOString(),
					localDirectoriesStatus: 'ready',
					databaseStatus: 'error',
					databaseFileName: 'app.db',
					databasePath: null,
				},
				localDirectories: createLocalDirectoriesPayload(),
				databaseHealth: null,
			},
		})

		const { default: App } = await import('./App')
		render(<App />)

		expect(await screen.findByText('应用启动失败')).toBeInTheDocument()
		expect(useAppStore.getState()).toMatchObject({
			bootStage: APP_BOOT_STAGES.FAILED,
			isAppReady: false,
			localDirectoryStatus: 'ready',
			databaseStatus: 'error',
		})
	})

	test('目录初始化失败时应跳过数据库初始化并进入 ready', async () => {
		runBootstrapRuntimeMock.mockResolvedValueOnce({
			ok: false,
			error: {
				error: createAppError({
					code: 'IO_ERROR',
					message: '目录初始化失败',
					layer: 'bootstrap',
					module: 'bootstrap-runtime',
					operation: 'prepareLocalDirectories',
					correlationId: 'boot-3',
				}),
				snapshot: {
					correlationId: 'boot-3',
					startedAt: new Date().toISOString(),
					finishedAt: new Date().toISOString(),
					localDirectoriesStatus: 'error',
					databaseStatus: 'idle',
					databaseFileName: 'app.db',
					databasePath: null,
				},
				localDirectories: null,
				databaseHealth: null,
			},
		})

		const { default: App } = await import('./App')
		render(<App />)

		expect(await screen.findByText('应用启动失败')).toBeInTheDocument()
		await waitFor(() => {
			expect(useAppStore.getState().databaseHealth).toBeNull()
		})
		expect(useAppStore.getState()).toMatchObject({
			bootStage: APP_BOOT_STAGES.FAILED,
			isAppReady: false,
			localDirectoryStatus: 'error',
			databaseStatus: 'error',
		})
	})
})
