import { beforeEach, describe, expect, test, vi } from 'vitest'
import { useAppStore } from '@/stores/app.store'

const invokeMock = vi.fn<(...args: never[]) => Promise<unknown>>()
const loggerInfoMock = vi.fn<(...args: never[]) => void>()
const loggerErrorMock = vi.fn<(...args: never[]) => void>()

vi.mock('@tauri-apps/api/core', () => ({
	invoke: invokeMock,
}))

vi.mock('@/utils/logger', () => ({
	logger: {
		info: loggerInfoMock,
		error: loggerErrorMock,
	},
}))

describe('tauri.service', () => {
	beforeEach(() => {
		invokeMock.mockReset()
		loggerInfoMock.mockReset()
		loggerErrorMock.mockReset()
		useAppStore.getState().reset()
	})

	test('调用成功时应返回成功结果并更新命令状态', async () => {
		const { invokeTauriCommand } = await import('./tauri.service')

		invokeMock.mockResolvedValueOnce({
			data: {
				value: 1,
			},
		})

		const result = await invokeTauriCommand<{ value: number }>('demo_command', {
			id: 1,
		})

		expect(result).toEqual({
			ok: true,
			data: {
				value: 1,
			},
		})
		expect(invokeMock).toHaveBeenCalledWith('demo_command', {
			id: 1,
		})
		expect(useAppStore.getState().commandBridgeStatus).toBe('ready')
		expect(useAppStore.getState().lastCommandName).toBe('demo_command')
		expect(loggerInfoMock).toHaveBeenCalled()
	})

	test('结构化错误对象应保留原始错误码并写入 store', async () => {
		const { invokeTauriCommand } = await import('./tauri.service')

		invokeMock.mockRejectedValueOnce({
			code: 'NOT_FOUND',
			message: '未找到',
			details: 'missing',
		})

		const result = await invokeTauriCommand('demo_command')

		expect(result.ok).toBe(false)
		if (result.ok) {
			throw new Error('结构化错误不应返回成功结果')
		}
		expect(result.error).toMatchObject({
			code: 'NOT_FOUND',
			message: '未找到',
			details: 'missing',
			command: 'demo_command',
		})
		expect(useAppStore.getState().lastError).toMatchObject({
			code: 'NOT_FOUND',
			command: 'demo_command',
		})
		expect(loggerErrorMock).toHaveBeenCalled()
	})

	test('字符串化 JSON 错误应被解析成结构化错误', async () => {
		const { invokeTauriCommand } = await import('./tauri.service')

		invokeMock.mockRejectedValueOnce(
			JSON.stringify({
				code: 'INVALID_ARGUMENT',
				message: '参数错误',
				details: 'bad-request',
			}),
		)

		const result = await invokeTauriCommand('demo_command')

		expect(result.ok).toBe(false)
		if (result.ok) {
			throw new Error('JSON 字符串错误不应返回成功结果')
		}
		expect(result.error).toMatchObject({
			code: 'INVALID_ARGUMENT',
			message: '参数错误',
			details: 'bad-request',
			command: 'demo_command',
		})
	})

	test('普通字符串错误应退化为 UNKNOWN_ERROR', async () => {
		const { invokeTauriCommand } = await import('./tauri.service')

		invokeMock.mockRejectedValueOnce('plain failure')

		const result = await invokeTauriCommand('demo_command')

		expect(result.ok).toBe(false)
		if (result.ok) {
			throw new Error('普通字符串错误不应返回成功结果')
		}
		expect(result.error).toMatchObject({
			code: 'UNKNOWN_ERROR',
			message: 'plain failure',
			command: 'demo_command',
		})
	})

	test('未知错误对象应归一化为命令失败错误', async () => {
		const { invokeTauriCommand } = await import('./tauri.service')

		invokeMock.mockRejectedValueOnce(new Error('boom'))

		const result = await invokeTauriCommand('demo_command')

		expect(result.ok).toBe(false)
		if (result.ok) {
			throw new Error('未知错误对象不应返回成功结果')
		}
		expect(result.error).toMatchObject({
			code: 'UNKNOWN_ERROR',
			message: '命令 demo_command 调用失败',
			details: '未能解析 Tauri 返回的错误对象。',
			command: 'demo_command',
		})
	})
})
