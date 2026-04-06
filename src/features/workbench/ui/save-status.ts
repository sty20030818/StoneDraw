import type { SaveStatus } from '@/shared/types'

export function resolveSaveStatusMeta(saveStatus: SaveStatus) {
	if (saveStatus === 'saving') {
		return {
			label: '保存中',
			className: 'bg-sky-500/12 text-sky-700 ring-1 ring-sky-500/15',
			summary: '自动保存正在写入磁盘',
		}
	}

	if (saveStatus === 'error') {
		return {
			label: '保存失败',
			className: 'bg-rose-500/12 text-rose-700 ring-1 ring-rose-500/15',
			summary: '最近一次保存失败，建议手动重试',
		}
	}

	if (saveStatus === 'dirty') {
		return {
			label: '未保存',
			className: 'bg-amber-500/12 text-amber-700 ring-1 ring-amber-500/15',
			summary: '当前画布有尚未落盘的修改',
		}
	}

	return {
		label: '已保存',
		className: 'bg-emerald-500/12 text-emerald-700 ring-1 ring-emerald-500/15',
		summary: '当前文档已处于最新保存状态',
	}
}
