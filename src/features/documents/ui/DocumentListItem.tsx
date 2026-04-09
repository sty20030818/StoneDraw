import { useMemo, useState } from 'react'
import { Clock3Icon, FileIcon, MoreHorizontalIcon, PencilLineIcon, StarIcon, Trash2Icon } from 'lucide-react'
import {
	Badge,
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	Input,
} from '@/shared/ui'
import type { DocumentMeta } from '@/shared/types'
import { formatRelativeTime, resolveDocumentCategory } from './document-ui'

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
	const category = useMemo(() => resolveDocumentCategory(document.title), [document.title])
	const updatedLabel = useMemo(
		() => formatRelativeTime(document.lastOpenedAt ?? document.updatedAt),
		[document.lastOpenedAt, document.updatedAt],
	)

	return (
		<div className='bg-card transition-colors'>
			<div
				className='group/document-row grid cursor-pointer gap-3 px-4 py-3.5 text-left transition-colors hover:bg-primary/4 md:grid-cols-[2.5rem_minmax(0,1.7fr)_8.5rem_8.5rem_7.5rem_3rem] md:items-center'
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
				<div className='flex items-center justify-center'>
					<StarIcon className='size-4 text-muted-foreground/45 transition-colors group-hover/document-row:text-muted-foreground' />
				</div>
				<div className='min-w-0'>
					<div className='flex min-w-0 items-center gap-3'>
						<div className='grid size-10 shrink-0 place-items-center rounded-md border bg-background text-muted-foreground transition-colors group-hover/document-row:border-primary/20 group-hover/document-row:bg-primary/8 group-hover/document-row:text-primary'>
							<FileIcon className='size-4' />
						</div>
						<div className='min-w-0'>
							<p className='truncate text-sm font-medium text-foreground'>
								{document.title}
								{document.saveStatus === 'dirty' ? (
									<span className='ml-2 inline-block size-2 rounded-full bg-primary align-middle' />
								) : null}
							</p>
							<p className='mt-1 text-xs text-muted-foreground'>
								{document.lastOpenedAt ? `最近打开：${updatedLabel}` : '尚未记录'}
							</p>
						</div>
					</div>
				</div>
				<div>
					<Badge
						variant='secondary'
						className='border border-border/70 bg-muted/20 text-foreground/75'>
						{category}
					</Badge>
				</div>
				<div className='flex items-center gap-1.5 text-xs text-muted-foreground md:text-sm'>
					<Clock3Icon className='size-3.5 text-muted-foreground/80' />
					<span>{updatedLabel}</span>
				</div>
				<div className='text-xs md:text-sm'>
					<span
						className={[
							'inline-flex items-center gap-2 font-medium',
							statusMeta.variant === 'success'
								? 'text-emerald-600'
								: statusMeta.variant === 'warning'
									? 'text-primary'
									: statusMeta.variant === 'destructive'
										? 'text-destructive'
										: 'text-muted-foreground',
						].join(' ')}>
						<span
							className={[
								'inline-block size-2 rounded-full',
								statusMeta.variant === 'success'
									? 'bg-emerald-500'
									: statusMeta.variant === 'warning'
										? 'bg-primary'
										: statusMeta.variant === 'destructive'
											? 'bg-destructive'
											: 'bg-muted-foreground/60',
							].join(' ')}
						/>
						{statusMeta.label === '已保存' ? '已持久化' : statusMeta.label}
					</span>
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
								className='opacity-0 transition-opacity group-hover/document-row:opacity-100 group-focus-within/document-row:opacity-100 focus-visible:opacity-100'
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
				<div className='border-t bg-muted/10 px-4 py-3'>
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
