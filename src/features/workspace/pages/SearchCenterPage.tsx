import { SearchIcon } from 'lucide-react'
import WorkspaceFeaturePlaceholderPage from './WorkspaceFeaturePlaceholderPage'

function SearchCenterPage() {
	return (
		<WorkspaceFeaturePlaceholderPage
			title='搜索中心'
			description='这里是 StoneDraw 的正式全局检索页，用于后续承接跨文档、模板和素材的搜索结果，但本轮不与 topbar 轻量搜索互通。'
			icon={SearchIcon}
			eyebrow='Workspace Search'
			cards={[
				{
					label: 'Results',
					title: '文档结果',
					description: '后续展示文档标题、命中摘要和状态信息，承担完整搜索结果页职责。',
				},
				{
					label: 'Results',
					title: '模板与素材结果',
					description: '预留跨模板与素材的统一搜索入口，避免分散在不同页面里重复检索。',
				},
				{
					label: 'Filters',
					title: '结果筛选',
					description: '后续可增加分类、来源和匹配方式等筛选条件，但本轮先建立页面结构位。',
				},
				{
					label: 'Command',
					title: '命令辅助',
					description: '命令面板仍保持轻量入口，未来可与搜索中心共享部分结果模型而不混淆语义。',
				},
			]}
		/>
	)
}

export default SearchCenterPage
