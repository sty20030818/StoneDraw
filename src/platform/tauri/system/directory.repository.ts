import { invokeTauriCommand } from '@/platform/tauri'
import type { LocalDirectoriesPayload, TauriCommandResult } from '@/shared/types'

const DIRECTORY_COMMANDS = {
	PREPARE_LOCAL_DIRECTORIES: 'files_prepare_local_directories',
} as const

export const directoryRepository = {
	async prepareLocalDirectories(correlationId?: string): Promise<TauriCommandResult<LocalDirectoriesPayload>> {
		return invokeTauriCommand<LocalDirectoriesPayload>(DIRECTORY_COMMANDS.PREPARE_LOCAL_DIRECTORIES, undefined, {
			module: 'directory-repository',
			operation: 'prepareLocalDirectories',
			layer: 'repository',
			correlationId,
		})
	},
}
