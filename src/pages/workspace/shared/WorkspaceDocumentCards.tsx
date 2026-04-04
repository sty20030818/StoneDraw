import { useMemo, useState } from 'react'
import { MoreHorizontalIcon, PencilLineIcon, Trash2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { DocumentMeta } from '@/types'
import { formatDateTime } from '@/utils/date'

type WorkspaceDocumentCardsProps = {
	documents: DocumentMeta[]
	onOpen: (documentId: string) => void
	onRename: (documentId: string, title: string) => Promise<boolean>
	onMoveToTrash: (document: DocumentMeta) => void
}

function WorkspaceDocumentCards({
	documents,
	onOpen,
	onRename,
	onMoveToTrash,
}: WorkspaceDocumentCardsProps) {
	const [expandedDocumentId, setExpandedDocumentId] = useState<string | null>(null)
	const [editingDocumentId, setEditingDocumentId] = useState<string | null>(null)
	const [renameDraft, setRenameDraft] = useState('')
	const [pendingDocumentId, setPendingDocumentId] = useState<string | null>(null)

	const documentCountLabel = useMemo(() => `${documents.length} 个文档`, [documents.length])

	function toggleDocumentActions(document: DocumentMeta) {
		if (expandedDocumentId === document.id) {
			setExpandedDocumentId(null)
			setEditingDocumentId(null)
			setRenameDraft('')
			return
		}

		setExpandedDocumentId(document.id)
		setEditingDocumentId(null)
		setRenameDraft(document.title)
	}

	return (
		<div className='rounded-[1.75rem] border border-border/70 bg-card/78 p-6'>
			<div className='flex items-center justify-between gap-3'>
				<div>
					<h3 className='text-lg font-semibold tracking-tight'>文档主列表</h3>
					<p className='mt-2 text-sm leading-6 text-muted-foreground'>保留真实文档浏览、重命名、删除到回收站和打开链路。</p>
				</div>
				<div className='rounded-full border border-border/70 bg-background/90 px-4 py-2 text-xs text-muted-foreground'>
					{documentCountLabel}
				</div>
			</div>

			<div className='mt-5 grid gap-3'>
				{documents.map((document) => {
					const isExpanded = expandedDocumentId === document.id
					const isEditing = editingDocumentId === document.id
					const isPending = pendingDocumentId === document.id

					return (
						<div
							key={document.id}
							className='rounded-[1.25rem] border border-border/70 bg-background/88 p-4'>
							<div className='flex items-start justify-between gap-3'>
								<button
									type='button'
									className='min-w-0 flex-1 text-left'
									onClick={() => {
										void onOpen(document.id)
									}}>
									<p className='truncate text-sm font-semibold'>{document.title}</p>
									<p className='mt-2 text-xs text-muted-foreground'>更新于 {formatDateTime(document.updatedAt)}</p>
								</button>
								<Button
									type='button'
									size='icon'
									variant='outline'
									disabled={isPending}
									title='更多操作'
									onClick={() => {
										toggleDocumentActions(document)
									}}>
									<MoreHorizontalIcon />
								</Button>
							</div>

							{isExpanded ? (
								<div className='mt-4 rounded-[1rem] border border-border/70 bg-card/80 p-3'>
									{isEditing ? (
										<div className='flex flex-col gap-3'>
											<Input
												value={renameDraft}
												onChange={(event) => {
													setRenameDraft(event.target.value)
												}}
												placeholder='输入新的文档标题'
											/>
											<div className='flex flex-wrap gap-2'>
												<Button
													type='button'
													disabled={isPending}
													onClick={async () => {
														setPendingDocumentId(document.id)
														const isSuccess = await onRename(document.id, renameDraft)
														setPendingDocumentId(null)
														if (isSuccess) {
															setExpandedDocumentId(null)
															setEditingDocumentId(null)
															setRenameDraft('')
														}
													}}>
													<PencilLineIcon data-icon='inline-start' />
													保存标题
												</Button>
												<Button
													type='button'
													variant='outline'
													disabled={isPending}
													onClick={() => {
														setEditingDocumentId(null)
														setRenameDraft(document.title)
													}}>
													取消
												</Button>
											</div>
										</div>
									) : (
										<div className='flex flex-wrap gap-2'>
											<Button
												type='button'
												variant='outline'
												onClick={() => {
													setEditingDocumentId(document.id)
													setRenameDraft(document.title)
												}}>
												<PencilLineIcon data-icon='inline-start' />
												重命名
											</Button>
											<Button
												type='button'
												variant='outline'
												onClick={() => {
													onMoveToTrash(document)
												}}>
												<Trash2Icon data-icon='inline-start' />
												删除到回收站
											</Button>
										</div>
									)}
								</div>
							) : null}
						</div>
					)
				})}
			</div>
		</div>
	)
}

export default WorkspaceDocumentCards
