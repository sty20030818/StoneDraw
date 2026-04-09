import type { DocumentMeta } from '@/shared/types'

export function formatRelativeTime(value: number | null) {
	if (!value) {
		return '尚未记录'
	}

	const now = Date.now()
	const diff = Math.max(0, now - value)
	const minute = 60 * 1000
	const hour = 60 * minute
	const day = 24 * hour

	if (diff < hour) {
		const minutes = Math.max(1, Math.floor(diff / minute))
		return minutes <= 1 ? '刚刚' : `${minutes} 分钟前`
	}

	if (diff < day) {
		const hours = Math.floor(diff / hour)
		return `${hours} 小时前`
	}

	if (diff < day * 2) {
		return '昨天'
	}

	return `${Math.floor(diff / day)} 天前`
}

export function resolveDocumentCategory(title: string) {
	if (title.includes('架构') || title.includes('模块')) {
		return '架构'
	}

	if (title.includes('业务') || title.includes('流程')) {
		return '业务'
	}

	if (title.includes('PRD') || title.includes('产品')) {
		return '产品'
	}

	if (title.includes('数据库') || title.includes('后端')) {
		return '后端'
	}

	return '文档'
}

export function sortDocumentsByLastOpened(documents: DocumentMeta[]) {
	return [...documents]
		.filter((document) => document.lastOpenedAt)
		.sort((left, right) => (right.lastOpenedAt ?? 0) - (left.lastOpenedAt ?? 0))
}
