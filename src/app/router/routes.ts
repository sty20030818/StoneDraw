import {
	APP_ROUTES,
	type AppRoutePath,
} from '@/constants/routes'

export type WorkspaceNavItem = {
	key: 'home' | 'documents' | 'templates' | 'search' | 'archive' | 'team' | 'settings'
	label: string
	path: AppRoutePath
	description: string
}

export type WorkbenchActivityItem = {
	key: 'explorer' | 'search' | 'library' | 'history' | 'team'
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
		key: 'templates',
		label: '模板与素材',
		path: APP_ROUTES.WORKSPACE_TEMPLATES,
		description: '可复用资源中心',
	},
	{
		key: 'search',
		label: '搜索',
		path: APP_ROUTES.WORKSPACE_SEARCH,
		description: '搜索中心入口',
	},
	{
		key: 'archive',
		label: '回收与历史',
		path: APP_ROUTES.WORKSPACE_ARCHIVE,
		description: '恢复与归档入口',
	},
	{
		key: 'team',
		label: '团队与共享',
		path: APP_ROUTES.WORKSPACE_TEAM,
		description: '团队能力预留位',
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
	{ key: 'search', label: 'Search', description: '工作台内快速检索' },
	{ key: 'library', label: 'Library', description: '模板片段与素材调用' },
	{ key: 'history', label: 'History', description: '版本与活动入口' },
	{ key: 'team', label: 'Team', description: '共享与协作预留位' },
]
