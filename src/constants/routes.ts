import { BrushCleaningIcon, FolderKanbanIcon } from 'lucide-react'

export const APP_ROUTES = {
	ROOT: '/',
	WORKSPACE: '/workspace',
	WORKSPACE_HOME: '/workspace/home',
	WORKSPACE_DOCUMENTS: '/workspace/documents',
	WORKSPACE_TEMPLATES: '/workspace/templates',
	WORKSPACE_SEARCH: '/workspace/search',
	WORKSPACE_ARCHIVE: '/workspace/archive',
	WORKSPACE_TEAM: '/workspace/team',
	WORKSPACE_SETTINGS: '/workspace/settings',
	WORKBENCH: '/workbench',
} as const

export function buildWorkbenchRoute(documentId?: string): string {
	if (!documentId) {
		return APP_ROUTES.WORKBENCH
	}

	const searchParams = new URLSearchParams({
		documentId,
	})

	return `${APP_ROUTES.WORKBENCH}?${searchParams.toString()}`
}

export type AppRoutePath = (typeof APP_ROUTES)[keyof typeof APP_ROUTES]

export type AppSceneKey = 'workspace' | 'workbench' | 'not-found'

export type AppSceneMeta = {
	key: AppSceneKey
	label: string
	description: string
	path: string
	icon?: typeof FolderKanbanIcon
}

export const APP_SCENES: Record<AppSceneKey, AppSceneMeta> = {
	workspace: {
		key: 'workspace',
		label: '工作区',
		description: '管理文档、模板、搜索、归档与设置的管理态。',
		path: APP_ROUTES.WORKSPACE_HOME,
		icon: FolderKanbanIcon,
	},
	workbench: {
		key: 'workbench',
		label: '工作台',
		description: '承载文档创作、面板和状态反馈的创作态。',
		path: APP_ROUTES.WORKBENCH,
		icon: BrushCleaningIcon,
	},
	'not-found': {
		key: 'not-found',
		label: '未命中页面',
		description: '路由未命中时返回统一兜底页。',
		path: '*',
	},
}

export const MAIN_NAV_ITEMS = [APP_SCENES.workspace, APP_SCENES.workbench] as const

export function resolveSceneByPathname(pathname: string): AppSceneMeta {
	if (pathname.startsWith(APP_ROUTES.WORKBENCH)) {
		return APP_SCENES.workbench
	}

	if (pathname === APP_ROUTES.ROOT || pathname.startsWith(APP_ROUTES.WORKSPACE)) {
		return APP_SCENES.workspace
	}

	return APP_SCENES['not-found']
}
