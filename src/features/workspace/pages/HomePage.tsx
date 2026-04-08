import { FolderOpenIcon } from 'lucide-react'
import { EmptyState, PageSection, SectionHeader, WorkspacePageShell } from '@/shared/components'
import { HomeQuickActions, RecentDocumentList } from '@/features/documents'
import { formatDateTime } from '@/shared/lib/date'
import { useOverlayStore } from '@/features/overlays'
import { useWorkspaceDocuments } from '@/features/workspace/hooks'
import { useWorkspaceStore } from '@/features/workspace/state'

function HomePage() {
	const recentDocuments = useWorkspaceStore((state) => state.recentDocuments)
	const collectionStatus = useWorkspaceStore((state) => state.collectionStatus)
	const openNewDocumentDialog = useOverlayStore((state) => state.openNewDocumentDialog)
	const { handleOpenDocument } = useWorkspaceDocuments()

	return (
		<WorkspacePageShell
			title='继续工作'
			description='在统一页面壳内保留快捷动作与最近打开，作为正式 Workspace 首页的稳定骨架。'>
			<PageSection
				header={
					<SectionHeader
						title='快捷动作'
						description='快速新建空白文档，或继续最近一次打开的内容。'
					/>
				}>
				<HomeQuickActions
					recentDocuments={recentDocuments}
					onCreate={() => {
						openNewDocumentDialog({
							source: 'home-page',
						})
					}}
					onContinue={() => {
						const firstDocument = recentDocuments[0]
						if (firstDocument) {
							void handleOpenDocument(firstDocument.id)
						}
					}}
				/>
			</PageSection>

			<PageSection
				header={
					<SectionHeader
						title='最近打开'
						description='保留最近打开文档，作为继续工作入口。'
						actions={<span className='text-xs text-muted-foreground'>{recentDocuments.length} 条记录</span>}
					/>
				}>
				{collectionStatus === 'ready' && recentDocuments.length > 0 ? (
					<RecentDocumentList
						documents={recentDocuments}
						onOpen={(documentId) => {
							void handleOpenDocument(documentId)
						}}
					/>
				) : (
					<div className='mt-5'>
						<EmptyState
							title='最近打开为空'
							description='当前还没有最近打开记录，进入文档后这里会出现继续工作入口。'
							icon={FolderOpenIcon}
						/>
					</div>
				)}
			</PageSection>

			<PageSection
				header={
					<SectionHeader
						title='最近活动'
						description='保留轻量活动区，强化继续工作路径，但不扩成复杂首页。'
					/>
				}>
				{recentDocuments.length > 0 ? (
					<div className='grid gap-3'>
						{recentDocuments.slice(0, 3).map((document) => (
							<div
								key={document.id}
								className='flex items-center justify-between gap-3 rounded-lg border bg-background px-4 py-3'>
								<div className='min-w-0'>
									<p className='truncate text-sm font-medium text-foreground'>{document.title}</p>
									<p className='mt-1 text-xs text-muted-foreground'>最近打开：{document.lastOpenedAt ? formatDateTime(document.lastOpenedAt) : '尚未记录'}</p>
								</div>
								<span className='text-xs text-muted-foreground'>继续工作</span>
							</div>
						))}
					</div>
				) : (
					<div className='rounded-lg border border-dashed bg-background px-4 py-5 text-sm text-muted-foreground'>
						最近活动会在你持续使用文档后出现在这里。
					</div>
				)}
			</PageSection>
		</WorkspacePageShell>
	)
}

export default HomePage
