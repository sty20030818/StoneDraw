import { FilePlus2Icon, FolderOpenIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import EmptyState from '@/components/states/EmptyState'
import { useDocumentStore } from '@/stores/document.store'
import { formatDateTime } from '@/utils/date'
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
				<div className='mt-5 flex flex-wrap gap-3'>
					<Button
						type='button'
						onClick={() => {
							void handleCreateDocument()
						}}>
						<FilePlus2Icon data-icon='inline-start' />
						新建空白文档
					</Button>
					<Button
						type='button'
						variant='outline'
						onClick={() => {
							const firstDocument = recentDocuments[0]
							if (firstDocument) {
								void handleOpenDocument(firstDocument.id)
							}
						}}>
						<FolderOpenIcon data-icon='inline-start' />
						继续最近文档
					</Button>
				</div>
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
					<div className='mt-5 grid gap-3'>
						{recentDocuments.map((document) => (
							<button
								key={document.id}
								type='button'
								className='rounded-[1.25rem] border border-border/70 bg-background/88 px-4 py-4 text-left transition-colors hover:bg-background'
								onClick={() => {
									void handleOpenDocument(document.id)
								}}>
								<p className='text-sm font-semibold'>{document.title}</p>
								<p className='mt-2 text-xs text-muted-foreground'>
									最近打开：{document.lastOpenedAt ? formatDateTime(document.lastOpenedAt) : '尚未记录'}
								</p>
							</button>
						))}
					</div>
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
