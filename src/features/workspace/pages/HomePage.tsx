import { FolderOpenIcon } from 'lucide-react'
import EmptyState from '@/shared/components/EmptyState'
import { HomeQuickActions, RecentDocumentList } from '@/features/documents'
import { useOverlayStore } from '@/features/overlays'
import { useWorkspaceDocuments } from '@/features/workspace/hooks'
import { useWorkspaceStore } from '@/features/workspace/state'

function HomePage() {
	const recentDocuments = useWorkspaceStore((state) => state.recentDocuments)
	const collectionStatus = useWorkspaceStore((state) => state.collectionStatus)
	const openNewDocumentDialog = useOverlayStore((state) => state.openNewDocumentDialog)
	const { handleOpenDocument } = useWorkspaceDocuments()

	return (
		<div className='grid gap-5'>
			<section className='rounded-xl border bg-card p-6'>
				<h3 className='text-lg font-semibold tracking-tight'>继续工作页</h3>
				<p className='mt-3 text-sm leading-6 text-muted-foreground'>
					Home 正式承担继续工作与快速开始的入口，直接承接最近文档与新建动作。
				</p>
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
			</section>

			<section className='rounded-xl border bg-card p-6'>
				<div className='flex items-center justify-between gap-3'>
					<div>
						<h3 className='text-lg font-semibold tracking-tight'>最近继续工作</h3>
						<p className='mt-2 text-sm leading-6 text-muted-foreground'>保留最近打开文档作为 Home 的第一批真实内容。</p>
					</div>
					<div className='rounded-full border bg-muted/50 px-4 py-2 text-xs text-muted-foreground'>
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
