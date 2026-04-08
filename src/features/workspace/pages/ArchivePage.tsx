import { RotateCcwIcon } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { EmptyState, PageSection, SectionHeader, WorkspacePageShell } from '@/shared/components'
import { useOverlayStore } from '@/features/overlays'
import { formatDateTime } from '@/shared/lib/date'
import { useWorkspaceDocuments } from '@/features/workspace/hooks'
import { useWorkspaceStore } from '@/features/workspace/state'

function ArchivePage() {
	const trashedDocuments = useWorkspaceStore((state) => state.trashedDocuments)
	const collectionStatus = useWorkspaceStore((state) => state.collectionStatus)
	const openConfirmDialog = useOverlayStore((state) => state.openConfirmDialog)
	const { handleRestoreDocument, handlePermanentlyDeleteDocument } = useWorkspaceDocuments()

	return (
		<WorkspacePageShell
			title='回收与归档'
			description='统一回收站页面壳，保留恢复与永久删除链路，内容重排留到后续阶段。'
			actions={<span className='text-xs text-muted-foreground'>{trashedDocuments.length} 个已删除</span>}>
			<PageSection
				header={
					<SectionHeader
						title='回收站'
						description='以列表方式承接已删除文档的恢复与彻底清理。'
					/>
				}>
				{collectionStatus === 'ready' && trashedDocuments.length > 0 ? (
					<div className='overflow-hidden rounded-lg border bg-card'>
						<div className='grid gap-3 border-b bg-muted/30 px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid-cols-[minmax(0,1.8fr)_11rem_14rem] md:items-center'>
							<span>标题</span>
							<span>删除时间</span>
							<span className='text-right'>操作</span>
						</div>
						{trashedDocuments.map((document) => (
							<div
								key={document.id}
								className='grid gap-3 border-t border-border bg-background px-4 py-4 first:border-t-0 md:grid-cols-[minmax(0,1.8fr)_11rem_14rem] md:items-center'>
								<p className='truncate text-sm font-semibold'>{document.title}</p>
								<p className='text-xs text-muted-foreground'>{document.deletedAt ? formatDateTime(document.deletedAt) : '未记录'}</p>
								<div className='flex justify-end gap-2'>
									<Button
										type='button'
										variant='outline'
										onClick={() => {
											openConfirmDialog({
												title: '恢复文档',
												description: `确认将《${document.title}》从回收站恢复到文档库吗？`,
												confirmLabel: '恢复文档',
												cancelLabel: '取消',
												onConfirm: () => {
													void handleRestoreDocument(document)
												},
											})
										}}>
										恢复
									</Button>
									<Button
										type='button'
										variant='destructive'
										onClick={() => {
											openConfirmDialog({
												title: '永久删除',
												description: `确认永久删除《${document.title}》吗？该操作会清理文档目录与元数据，无法撤销。`,
												confirmLabel: '永久删除',
												cancelLabel: '取消',
												onConfirm: () => {
													void handlePermanentlyDeleteDocument(document)
												},
											})
										}}>
										永久删除
									</Button>
								</div>
							</div>
						))}
					</div>
				) : (
					<EmptyState
						title='回收站为空'
						description='当前没有已删除文档，删除到回收站后的内容会统一在这里恢复或彻底清理。'
						icon={RotateCcwIcon}
					/>
				)}
			</PageSection>
		</WorkspacePageShell>
	)
}

export default ArchivePage
