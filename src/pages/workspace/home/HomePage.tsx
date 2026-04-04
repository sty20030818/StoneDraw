import { FolderOpenIcon } from 'lucide-react'
import EmptyState from '@/components/states/EmptyState'
import { HomeQuickActions, RecentDocumentList } from '@/components/workspace'
import { useDocumentStore } from '@/stores/document.store'
import { useWorkspaceDocuments } from '@/pages/workspace/shared/useWorkspaceDocuments'

function HomePage() {
	const recentDocuments = useDocumentStore((state) => state.recentDocuments)
	const collectionStatus = useDocumentStore((state) => state.collectionStatus)
	const { handleCreateDocument, handleOpenDocument } = useWorkspaceDocuments()

	return (
		<div className='grid gap-5'>
			<section className='rounded-[1.75rem] border border-border/70 bg-card/78 p-6'>
				<h3 className='text-lg font-semibold tracking-tight'>继续工作页</h3>
				<p className='mt-3 text-sm leading-6 text-muted-foreground'>
					Home 现在正式承担继续工作与快速开始的入口，不再只是临时占位页。
				</p>
				<HomeQuickActions
					recentDocuments={recentDocuments}
					onCreate={() => {
						void handleCreateDocument()
					}}
					onContinue={() => {
						const firstDocument = recentDocuments[0]
						if (firstDocument) {
							void handleOpenDocument(firstDocument.id)
						}
					}}
				/>
			</section>

			<section className='rounded-[1.75rem] border border-border/70 bg-card/78 p-6'>
				<div className='flex items-center justify-between gap-3'>
					<div>
						<h3 className='text-lg font-semibold tracking-tight'>最近继续工作</h3>
						<p className='mt-2 text-sm leading-6 text-muted-foreground'>保留最近打开文档作为 Home 的第一批真实内容。</p>
					</div>
					<div className='rounded-full border border-border/70 bg-background/90 px-4 py-2 text-xs text-muted-foreground'>
						{recentDocuments.length} 条记录
					</div>
				</div>

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
			</section>
		</div>
	)
}

export default HomePage
