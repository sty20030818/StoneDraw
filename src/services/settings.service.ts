import { settingsRepository } from '@/repositories'
import type { TauriCommandResult } from '@/shared/types'

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
		return settingsRepository.read()
	},
	async save(settings: AppSettings): Promise<TauriCommandResult<AppSettings>> {
		return settingsRepository.save(settings)
	},
}
