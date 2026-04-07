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
		label: 'Home',
		path: APP_ROUTES.WORKSPACE_HOME,
		description: '继续工作与快速入口',
	},
	{
		key: 'documents',
		label: '我的文档',
		path: APP_ROUTES.WORKSPACE_DOCUMENTS,
		description: '文档主库与列表浏览',
	},
	{
		key: 'archive',
		label: '回收与历史',
		path: APP_ROUTES.WORKSPACE_ARCHIVE,
		description: '恢复与归档入口',
	},
	{
		key: 'settings',
		label: '设置',
		path: APP_ROUTES.WORKSPACE_SETTINGS,
		description: '系统设置与账户入口',
	},
]

export const WORKBENCH_ACTIVITY_ITEMS: WorkbenchActivityItem[] = [
	{ key: 'explorer', label: 'Explorer', description: '文档树与结构浏览' },
	{ key: 'history', label: 'History', description: '版本与活动入口' },
]
