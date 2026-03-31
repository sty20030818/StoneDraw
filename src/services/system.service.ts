import { TAURI_COMMANDS } from '@/constants'
import type { SystemDemoPayload, TauriCommandResult } from '@/types'
import { invokeTauriCommand } from './tauri.service'

export const systemService = {
	async runDemo(): Promise<TauriCommandResult<SystemDemoPayload>> {
		return invokeTauriCommand<SystemDemoPayload>(TAURI_COMMANDS.SYSTEM_DEMO)
	},
}
