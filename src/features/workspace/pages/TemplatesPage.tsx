import { LayoutTemplateIcon } from 'lucide-react'
import WorkspaceFeaturePlaceholderPage from './WorkspaceFeaturePlaceholderPage'

function TemplatesPage() {
	return (
		<WorkspaceFeaturePlaceholderPage
			title='模板与素材'
			description='这里会承接模板复用与素材调用入口，保持 Workspace 的统一管理态体验，并为后续 Workbench 资源接入提前站位。'
			icon={LayoutTemplateIcon}
			eyebrow='Workspace Library'
			cards={[
				{
					label: 'Templates',
					title: '官方模板',
					description: '提供常见图纸结构、流程图和架构图模板，后续可直接从这里新建文档。',
				},
				{
					label: 'Templates',
					title: '我的模板',
					description: '承接从当前文档保存为模板后的个人模板列表，建立稳定的复用入口。',
				},
				{
					label: 'Assets',
					title: '官方素材',
					description: '为图标、插图和常用资源提供统一入口，未来可延伸到 Workbench 中直接调用。',
				},
				{
					label: 'Assets',
					title: '我的素材',
					description: '预留个人素材与资源沉淀位置，后续与导入、预览和分类能力衔接。',
				},
			]}
		/>
	)
}

export default TemplatesPage
