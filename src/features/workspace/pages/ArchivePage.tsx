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
						description='统一承接已删除文档的恢复与彻底清理。'
					/>
				}>
				{collectionStatus === 'ready' && trashedDocuments.length > 0 ? (
					<div className='grid gap-3'>
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
