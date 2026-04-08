import { useMemo, useState } from 'react'
import { MoreHorizontalIcon, PencilLineIcon, Trash2Icon } from 'lucide-react'
import { Badge, Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, Input } from '@/shared/ui'
import { formatDateTime } from '@/shared/lib/date'
import type { DocumentMeta } from '@/shared/types'

type DocumentListItemProps = {
	document: DocumentMeta
	onOpen: (documentId: string) => void
	onRename: (documentId: string, title: string) => Promise<boolean>
	onMoveToTrash: (document: DocumentMeta) => void
}

function resolveDocumentStatusVariant(document: DocumentMeta) {
	if (document.saveStatus === 'error') {
		return {
			label: '保存失败',
			variant: 'destructive' as const,
		}
	}

	if (document.saveStatus === 'dirty') {
		return {
			label: '未保存',
			variant: 'warning' as const,
		}
	}

	if (document.saveStatus === 'saving') {
		return {
			label: '保存中',
			variant: 'outline' as const,
		}
	}

	return {
		label: '已保存',
		variant: 'success' as const,
	}
}

function DocumentListItem({ document, onOpen, onRename, onMoveToTrash }: DocumentListItemProps) {
	const [isEditing, setIsEditing] = useState(false)
	const [renameDraft, setRenameDraft] = useState(document.title)
	const [isPending, setIsPending] = useState(false)
	const statusMeta = useMemo(() => resolveDocumentStatusVariant(document), [document])

	return (
		<div className='rounded-lg border bg-background transition-colors hover:border-border hover:bg-muted/20'>
			<div
				className='grid cursor-pointer gap-3 px-4 py-3 md:grid-cols-[minmax(0,1.8fr)_10rem_6.5rem_3rem] md:items-center'
				onClick={() => {
					if (!isEditing) {
						void onOpen(document.id)
					}
				}}
				role='button'
				tabIndex={0}
				onKeyDown={(event) => {
					if ((event.key === 'Enter' || event.key === ' ') && !isEditing) {
						event.preventDefault()
						void onOpen(document.id)
					}
				}}>
				<div className='min-w-0'>
					<p className='truncate text-sm font-medium text-foreground'>{document.title}</p>
					<p className='mt-1 text-xs text-muted-foreground'>最近打开：{document.lastOpenedAt ? formatDateTime(document.lastOpenedAt) : '尚未记录'}</p>
				</div>
				<div className='text-sm text-muted-foreground'>{formatDateTime(document.updatedAt)}</div>
				<div>
					<Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
				</div>
				<div
					className='flex justify-end'
					onClick={(event) => {
						event.stopPropagation()
					}}>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								type='button'
								variant='ghost'
								size='icon-sm'
								title='更多操作'
								disabled={isPending}>
								<MoreHorizontalIcon />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align='end'>
							<DropdownMenuLabel>文档操作</DropdownMenuLabel>
							<DropdownMenuItem
								onSelect={() => {
									void onOpen(document.id)
								}}>
								打开文档
							</DropdownMenuItem>
							<DropdownMenuItem
								onSelect={() => {
									setIsEditing(true)
									setRenameDraft(document.title)
								}}>
								<PencilLineIcon />
								重命名
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								className='text-destructive data-highlighted:bg-destructive/10 data-highlighted:text-destructive'
								onSelect={() => {
									onMoveToTrash(document)
								}}>
								<Trash2Icon />
								删除到回收站
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			{isEditing ? (
				<div className='border-t bg-card/60 px-4 py-3'>
					<div className='flex flex-col gap-3 md:flex-row md:items-center'>
						<Input
							autoFocus
							value={renameDraft}
							onClick={(event) => {
								event.stopPropagation()
							}}
							onChange={(event) => {
								setRenameDraft(event.target.value)
							}}
							placeholder='输入新的文档标题'
						/>
						<div className='flex items-center gap-2'>
							<Button
								type='button'
								size='sm'
								disabled={isPending}
								onClick={async (event) => {
									event.stopPropagation()
									setIsPending(true)
									const isSuccess = await onRename(document.id, renameDraft)
									setIsPending(false)
									if (isSuccess) {
										setIsEditing(false)
									}
								}}>
								保存标题
							</Button>
							<Button
								type='button'
								size='sm'
								variant='outline'
								disabled={isPending}
								onClick={(event) => {
									event.stopPropagation()
									setRenameDraft(document.title)
									setIsEditing(false)
								}}>
								取消
							</Button>
						</div>
					</div>
				</div>
			) : null}
		</div>
	)
}

export default DocumentListItem
