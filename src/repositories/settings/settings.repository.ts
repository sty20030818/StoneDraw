import { TAURI_COMMANDS } from '@/constants'
import { invokeTauriCommand } from '@/infra/tauri'
import type { TauriCommandResult } from '@/types'
import type { AppSettings } from '@/services/settings.service'

export const settingsRepository = {
	async read(correlationId?: string): Promise<TauriCommandResult<AppSettings>> {
		return invokeTauriCommand<AppSettings>(TAURI_COMMANDS.SETTINGS_READ, undefined, {
			module: 'settings-repository',
			operation: 'read',
			layer: 'repository',
			correlationId,
		})
	},
	async save(settings: AppSettings, correlationId?: string): Promise<TauriCommandResult<AppSettings>> {
		return invokeTauriCommand<AppSettings>(
			TAURI_COMMANDS.SETTINGS_SAVE,
			{
				language: settings.language,
				theme: settings.theme,
			},
			{
				module: 'settings-repository',
				operation: 'save',
				layer: 'repository',
				correlationId,
			},
		)
	},
}
