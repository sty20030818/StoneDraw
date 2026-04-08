import { RotateCcwIcon } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import EmptyState from '@/shared/components/EmptyState'
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
		<div className='rounded-xl border bg-card p-6'>
			<div className='flex items-center justify-between gap-3'>
				<div>
					<h3 className='text-lg font-semibold tracking-tight'>Archive 页面容器</h3>
					<p className='mt-2 text-sm leading-6 text-muted-foreground'>回收与历史页现在承接回收站文档恢复入口。</p>
				</div>
				<div className='rounded-full border bg-muted/50 px-4 py-2 text-xs text-muted-foreground'>
					{trashedDocuments.length} 个已删除
				</div>
			</div>

			{collectionStatus === 'ready' && trashedDocuments.length > 0 ? (
				<div className='mt-5 grid gap-3'>
					{trashedDocuments.map((document) => (
						<div
							key={document.id}
							className='rounded-lg border bg-background px-4 py-4'>
							<p className='text-sm font-semibold'>{document.title}</p>
							<p className='mt-2 text-xs text-muted-foreground'>
								删除时间：{document.deletedAt ? formatDateTime(document.deletedAt) : '未记录'}
							</p>
							<div className='mt-4'>
								<Button
									type='button'
									variant='outline'
									onClick={() => {
										openConfirmDialog({
											title: '恢复或永久删除',
											description: `《${document.title}》当前在回收站中。你可以恢复它，或直接永久删除文档目录与元数据。`,
											confirmLabel: '恢复文档',
											cancelLabel: '取消',
											secondaryActionLabel: '永久删除',
											onConfirm: () => {
												void handleRestoreDocument(document)
											},
											onSecondaryAction: () => {
												void handlePermanentlyDeleteDocument(document)
											},
										})
									}}>
									<RotateCcwIcon data-icon='inline-start' />
									恢复或删除
								</Button>
							</div>
						</div>
					))}
				</div>
			) : (
				<div className='mt-5'>
					<EmptyState
						title='回收站为空'
						description='当前没有已删除文档，删除到回收站后的内容会统一在这里恢复或彻底清理。'
						icon={RotateCcwIcon}
					/>
				</div>
			)}
		</div>
	)
}

export default ArchivePage
