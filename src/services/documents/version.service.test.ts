import { beforeEach, describe, expect, test, vi } from 'vitest'
import { createAppError } from '@/test/fixtures/error'
import { createDocumentVersionMeta } from '@/test/fixtures/version'

const createManualMock = vi.fn<(...args: never[]) => Promise<unknown>>()
const listByDocumentMock = vi.fn<(...args: never[]) => Promise<unknown>>()

vi.mock('@/repositories', () => ({
	versionRepository: {
		createManual: createManualMock,
		listByDocument: listByDocumentMock,
	},
}))

describe('version.service', () => {
	beforeEach(() => {
		createManualMock.mockReset()
		listByDocumentMock.mockReset()
	})

	test('createManualVersion 应透传到 repository', async () => {
		const result = {
			ok: true,
			data: createDocumentVersionMeta(),
		}

		createManualMock.mockResolvedValue(result)

		const { versionService } = await import('./version.service')

		await expect(versionService.createManualVersion('doc-version-1')).resolves.toEqual(result)
		expect(createManualMock).toHaveBeenCalledWith('doc-version-1')
	})

	test('listDocumentVersions 应透传失败结果', async () => {
		const failureResult = {
			ok: false,
			error: createAppError({
				code: 'DB_ERROR',
				message: '版本列表读取失败',
				module: 'version-repository',
				operation: 'listByDocument',
			}),
		}

		listByDocumentMock.mockResolvedValue(failureResult)

		const { versionService } = await import('./version.service')

		await expect(versionService.listDocumentVersions('doc-version-2')).resolves.toEqual(failureResult)
		expect(listByDocumentMock).toHaveBeenCalledWith('doc-version-2')
	})
})
