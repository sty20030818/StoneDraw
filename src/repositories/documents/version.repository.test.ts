import { beforeEach, describe, expect, test, vi } from 'vitest'
import { TAURI_COMMANDS } from '@/shared/constants'
import { createDocumentVersionMeta } from '@/test/fixtures/version'

const invokeTauriCommandMock = vi.fn<(...args: never[]) => Promise<unknown>>()

vi.mock('@/platform/tauri', () => ({
	invokeTauriCommand: invokeTauriCommandMock,
}))

describe('version.repository', () => {
	beforeEach(() => {
		invokeTauriCommandMock.mockReset()
	})

	test('createManual 应调用 versions_create 命令', async () => {
		const result = {
			ok: true,
			data: createDocumentVersionMeta(),
		}

		invokeTauriCommandMock.mockResolvedValue(result)

		const { versionRepository } = await import('./version.repository')

		await expect(versionRepository.createManual('doc-version-1', 'correlation-1')).resolves.toEqual(result)
		expect(invokeTauriCommandMock).toHaveBeenCalledWith(
			TAURI_COMMANDS.VERSIONS_CREATE,
			{
				documentId: 'doc-version-1',
			},
			expect.objectContaining({
				module: 'version-repository',
				operation: 'createManual',
				layer: 'repository',
				objectId: 'doc-version-1',
				correlationId: 'correlation-1',
			}),
		)
	})

	test('listByDocument 应调用 versions_list 命令', async () => {
		const result = {
			ok: true,
			data: [createDocumentVersionMeta()],
		}

		invokeTauriCommandMock.mockResolvedValue(result)

		const { versionRepository } = await import('./version.repository')

		await expect(versionRepository.listByDocument('doc-version-2')).resolves.toEqual(result)
		expect(invokeTauriCommandMock).toHaveBeenCalledWith(
			TAURI_COMMANDS.VERSIONS_LIST,
			{
				documentId: 'doc-version-2',
			},
			expect.objectContaining({
				module: 'version-repository',
				operation: 'listByDocument',
				layer: 'repository',
				objectId: 'doc-version-2',
			}),
		)
	})
})
