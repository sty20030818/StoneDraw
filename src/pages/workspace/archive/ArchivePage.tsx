import { RotateCcwIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import EmptyState from '@/components/states/EmptyState'
import { useWorkspaceStore } from '@/stores/workspace.store'
import { formatDateTime } from '@/utils/date'
import { useWorkspaceDocuments } from '@/pages/workspace/shared/useWorkspaceDocuments'

function ArchivePage() {
	const trashedDocuments = useWorkspaceStore((state) => state.trashedDocuments)
	const documentsStatus = useWorkspaceStore((state) => state.documentsStatus)
	const { handleRestoreDocument } = useWorkspaceDocuments()

	return (
		<div className='rounded-[1.75rem] border border-border/70 bg-card/78 p-6'>
			<div className='flex items-center justify-between gap-3'>
				<div>
					<h3 className='text-lg font-semibold tracking-tight'>Archive 页面容器</h3>
					<p className='mt-2 text-sm leading-6 text-muted-foreground'>回收与历史页现在承接回收站文档恢复入口。</p>
				</div>
				<div className='rounded-full border border-border/70 bg-background/90 px-4 py-2 text-xs text-muted-foreground'>
					{trashedDocuments.length} 个已删除
				</div>
			</div>

			{documentsStatus === 'ready' && trashedDocuments.length > 0 ? (
				<div className='mt-5 grid gap-3'>
					{trashedDocuments.map((document) => (
						<div
							key={document.id}
							className='rounded-[1.25rem] border border-border/70 bg-background/88 px-4 py-4'>
							<p className='text-sm font-semibold'>{document.title}</p>
							<p className='mt-2 text-xs text-muted-foreground'>
								删除时间：{document.deletedAt ? formatDateTime(document.deletedAt) : '未记录'}
							</p>
							<div className='mt-4'>
								<Button
									type='button'
									variant='outline'
									onClick={() => {
										void handleRestoreDocument(document)
									}}>
									<RotateCcwIcon data-icon='inline-start' />
									恢复文档
								</Button>
							</div>
						</div>
					))}
				</div>
			) : (
				<div className='mt-5'>
					<EmptyState
						title='回收站为空'
						description='当前没有已删除文档，后续版本会在这里继续补齐历史与恢复能力。'
						icon={RotateCcwIcon}
					/>
				</div>
			)}
		</div>
	)
}

export default ArchivePage
