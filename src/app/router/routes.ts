import { APP_ROUTES, type AppRoutePath } from '@/shared/constants/routes'

export type WorkspaceNavItem = {
	key: 'home' | 'documents' | 'archive' | 'settings'
	label: string
	path: AppRoutePath
	description: string
}

export type WorkbenchActivityItem = {
	key: 'explorer' | 'history'
	label: string
	description: string
}

export const WORKSPACE_NAV_ITEMS: WorkspaceNavItem[] = [
	{
		key: 'home',
		label: '首页',
		path: APP_ROUTES.WORKSPACE_HOME,
		description: '快捷动作与最近打开',
	},
	{
		key: 'documents',
		label: '文档',
		path: APP_ROUTES.WORKSPACE_DOCUMENTS,
		description: '列表优先的正式文档库',
	},
	{
		key: 'archive',
		label: '归档',
		path: APP_ROUTES.WORKSPACE_ARCHIVE,
		description: '回收与恢复管理',
	},
	{
		key: 'settings',
		label: '设置',
		path: APP_ROUTES.WORKSPACE_SETTINGS,
		description: '应用设置与诊断信息',
	},
]

export const WORKBENCH_ACTIVITY_ITEMS: WorkbenchActivityItem[] = [
	{ key: 'explorer', label: '资源', description: '文档与上下文浏览' },
	{ key: 'history', label: '历史', description: '版本与时间线入口' },
]
