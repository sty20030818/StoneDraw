import { UsersIcon } from 'lucide-react'
import WorkspaceFeaturePlaceholderPage from './WorkspaceFeaturePlaceholderPage'

function TeamPage() {
	return (
		<WorkspaceFeaturePlaceholderPage
			title='团队与共享'
			description='这里是未来团队空间、共享内容和协作入口的正式落点。本轮先保持信息架构完整，不接入真实共享、成员或权限逻辑。'
			icon={UsersIcon}
			eyebrow='Workspace Collaboration'
			cards={[
				{
					label: 'Sharing',
					title: '与我共享',
					description: '承接来自未来共享链路的文档入口，让共享内容具备稳定的页面归属。',
				},
				{
					label: 'Team Space',
					title: '团队空间',
					description: '预留团队内容组织位，后续接团队资源、模板和文档归属能力。',
				},
				{
					label: 'Activity',
					title: '共享动态',
					description: '未来可在这里展示成员动作、共享变化和协作摘要，但本轮不实现业务逻辑。',
				},
				{
					label: 'Permissions',
					title: '权限与角色',
					description: '预留后续查看、编辑和管理权限的承载位，当前仅作为结构说明。',
				},
			]}
		/>
	)
}

export default TeamPage
