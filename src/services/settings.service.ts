import { TAURI_COMMANDS } from '@/constants'
import type { TauriCommandResult } from '@/types'
import { invokeTauriCommand } from './tauri.service'

export type AppSettings = {
	language: 'zh-CN'
	theme: 'system'
}

const defaultSettings: AppSettings = {
	language: 'zh-CN',
	theme: 'system',
}

export const settingsService = {
	getDefaults(): AppSettings {
		return defaultSettings
	},
	async read(): Promise<TauriCommandResult<AppSettings>> {
		return invokeTauriCommand<AppSettings>(TAURI_COMMANDS.SETTINGS_READ)
	},
	async save(settings: AppSettings): Promise<TauriCommandResult<AppSettings>> {
		return invokeTauriCommand<AppSettings>(TAURI_COMMANDS.SETTINGS_SAVE, {
			language: settings.language,
			theme: settings.theme,
		})
	},
}
