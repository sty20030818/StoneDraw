import { RotateCcwIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { APP_ROUTES } from '@/shared/constants/routes'
import { Button } from '@/shared/ui/button'
import { EmptyState, WorkspacePageShell } from '@/shared/components'
import { useOverlayStore } from '@/features/overlays'
import { formatDateTime } from '@/shared/lib/date'
import { useWorkspaceDocuments } from '@/features/workspace/hooks'
import { useWorkspaceStore } from '@/features/workspace/state'

function ArchivePage() {
	const navigate = useNavigate()
	const trashedDocuments = useWorkspaceStore((state) => state.trashedDocuments)
	const collectionStatus = useWorkspaceStore((state) => state.collectionStatus)
	const openConfirmDialog = useOverlayStore((state) => state.openConfirmDialog)
	const { handleRestoreDocument, handlePermanentlyDeleteDocument } = useWorkspaceDocuments()

	return (
		<WorkspacePageShell>
			<div className='animate-in fade-in duration-300'>
				<div className='mb-6 space-y-1.5'>
					<h1 className='text-3xl font-black tracking-tight text-foreground'>回收站</h1>
					<p className='text-sm text-muted-foreground'>以列表方式承接已删除文档的恢复与彻底清理。</p>
				</div>

				{collectionStatus === 'ready' && trashedDocuments.length > 0 ? (
					<div className='space-y-3'>
						<div className='hidden gap-3 px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid md:grid-cols-[minmax(0,1.8fr)_11rem_14rem] md:items-center'>
							<span>标题</span>
							<span>删除时间</span>
							<span className='text-right'>操作</span>
						</div>
						<div className='overflow-hidden rounded-lg border bg-card shadow-sm'>
							<div className='divide-y'>
						{trashedDocuments.map((document) => (
							<div
								key={document.id}
								className='grid gap-3 bg-card px-4 py-3.5 transition-colors hover:bg-primary/4 md:grid-cols-[minmax(0,1.8fr)_11rem_14rem] md:items-center'>
								<p className='truncate text-sm font-medium text-foreground'>{document.title}</p>
								<p className='text-xs text-muted-foreground md:text-sm'>
									{document.deletedAt ? formatDateTime(document.deletedAt) : '未记录'}
								</p>
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
						</div>
					</div>
				) : (
					<EmptyState
						title='回收站为空'
						description='当前没有已删除文档，删除到回收站后的内容会统一在这里恢复或彻底清理。'
						icon={RotateCcwIcon}
						actionLabel='返回文档库'
						onAction={() => {
							void navigate(APP_ROUTES.WORKSPACE_DOCUMENTS)
						}}
					/>
				)}
			</div>
		</WorkspacePageShell>
	)
}

export default ArchivePage
