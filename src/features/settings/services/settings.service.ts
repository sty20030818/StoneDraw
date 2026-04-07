import type { TauriCommandResult } from '@/shared/types'
import { settingsRepository } from '../api'
import { defaultSettings, type AppSettings } from '../model'

export const settingsService = {
	getDefaults(): AppSettings {
		return defaultSettings
	},
	async read(): Promise<TauriCommandResult<AppSettings>> {
		return settingsRepository.read()
	},
	async save(settings: AppSettings): Promise<TauriCommandResult<AppSettings>> {
		return settingsRepository.save(settings)
	},
}
