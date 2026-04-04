export type LocalStoragePlaceholder = {
	scope: 'workspace'
}

// 本地存储能力后续再接入真实持久化，这里先固定服务入口位置。
export function createLocalStoragePlaceholder(): LocalStoragePlaceholder {
	return {
		scope: 'workspace',
	}
}

export const localStorageService = {
	createPlaceholder: createLocalStoragePlaceholder,
}
