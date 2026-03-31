type LoggerLevel = 'info' | 'warn' | 'error'

function log(level: LoggerLevel, scope: string, message: string, context?: Record<string, unknown>) {
	const timestamp = new Date().toISOString()
	const prefix = `[StoneDraw][${scope}][${timestamp}]`

	if (level === 'error') {
		console.error(prefix, message, context ?? {})
		return
	}

	if (level === 'warn') {
		console.warn(prefix, message, context ?? {})
		return
	}

	console.info(prefix, message, context ?? {})
}

// 前端日志目前只做占位，后续再接入桌面日志与持久化。
export const logger = {
	info(scope: string, message: string, context?: Record<string, unknown>) {
		log('info', scope, message, context)
	},
	warn(scope: string, message: string, context?: Record<string, unknown>) {
		log('warn', scope, message, context)
	},
	error(scope: string, message: string, context?: Record<string, unknown>) {
		log('error', scope, message, context)
	},
}
