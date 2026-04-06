export function formatDateTime(value: Date | string | number): string {
	const date = value instanceof Date ? value : new Date(value)

	if (Number.isNaN(date.getTime())) {
		return '无效时间'
	}

	return new Intl.DateTimeFormat('zh-CN', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: false,
	}).format(date)
}

export function toIsoString(value: Date | string | number = new Date()): string {
	const date = value instanceof Date ? value : new Date(value)
	return date.toISOString()
}

export function toTimestamp(value: Date | string | number = new Date()): number {
	const date = value instanceof Date ? value : new Date(value)
	return date.getTime()
}
