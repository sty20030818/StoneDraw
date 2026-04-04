export type WorkspaceBootstrapResult = {
	ready: boolean
}

// Workspace 服务第一轮先占住正式位置，后续用于聚合工作区首页和文档列表的装载逻辑。
export const workspaceService = {
	createBootstrapSnapshot(): WorkspaceBootstrapResult {
		return {
			ready: true,
		}
	},
}
