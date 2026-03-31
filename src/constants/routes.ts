import { BrushCleaningIcon, FolderKanbanIcon, Settings2Icon } from 'lucide-react'

export const APP_ROUTES = {
	ROOT: '/',
	WORKSPACE: '/workspace',
	EDITOR: '/editor',
	SETTINGS: '/settings',
} as const

export function buildEditorRoute(documentId?: string): string {
	if (!documentId) {
		return APP_ROUTES.EDITOR
	}

	const searchParams = new URLSearchParams({
		documentId,
	})

	return `${APP_ROUTES.EDITOR}?${searchParams.toString()}`
}

export type AppRoutePath = (typeof APP_ROUTES)[keyof typeof APP_ROUTES]

export type AppSceneKey = 'workspace' | 'editor' | 'settings' | 'not-found'

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
		description: '管理草稿、入口与基础导航，是桌面应用的主场景。',
		path: APP_ROUTES.WORKSPACE,
		icon: FolderKanbanIcon,
	},
	editor: {
		key: 'editor',
		label: '编辑器',
		description: '承载 Excalidraw 画布、编辑状态与后续保存能力。',
		path: APP_ROUTES.EDITOR,
		icon: BrushCleaningIcon,
	},
	settings: {
		key: 'settings',
		label: '设置',
		description: '承载应用偏好、确认操作和全局反馈占位入口。',
		path: APP_ROUTES.SETTINGS,
		icon: Settings2Icon,
	},
	'not-found': {
		key: 'not-found',
		label: '未命中页面',
		description: '路由未命中时返回统一兜底页。',
		path: '*',
	},
}

export const MAIN_NAV_ITEMS = [APP_SCENES.workspace, APP_SCENES.editor, APP_SCENES.settings] as const

export function resolveSceneByPathname(pathname: string): AppSceneMeta {
	if (pathname.startsWith(APP_ROUTES.EDITOR)) {
		return APP_SCENES.editor
	}

	if (pathname.startsWith(APP_ROUTES.SETTINGS)) {
		return APP_SCENES.settings
	}

	if (pathname === APP_ROUTES.ROOT || pathname.startsWith(APP_ROUTES.WORKSPACE)) {
		return APP_SCENES.workspace
	}

	return APP_SCENES['not-found']
}
