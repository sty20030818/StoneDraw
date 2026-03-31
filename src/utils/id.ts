export function createId(prefix = 'stone'): string {
	return `${prefix}-${crypto.randomUUID()}`
}
