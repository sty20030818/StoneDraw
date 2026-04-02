import type { KeyboardEvent, ReactNode } from 'react'
import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
	Clock3Icon,
	DatabaseZapIcon,
	FilePlus2Icon,
	FileStackIcon,
	FolderKanbanIcon,
	FolderOpenIcon,
	LayoutGridIcon,
	MoreHorizontalIcon,
	PencilLineIcon,
	RefreshCwIcon,
	RotateCcwIcon,
	SearchIcon,
	Settings2Icon,
	Trash2Icon,
	type LucideIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import WorkbenchLayout from '@/components/layout/WorkbenchLayout'
import SceneTopbar, { SCENE_TOPBAR_SEARCH_INPUT_CLASS } from '@/components/layout/SceneTopbar'
import { useDialogHost } from '@/components/feedback/DialogHost'
import EmptyState from '@/components/states/EmptyState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { APP_ROUTES, buildEditorRoute } from '@/constants/routes'
import { cn } from '@/lib/utils'
import { documentService } from '@/services/document.service'
import { useAppStore } from '@/stores/app.store'
import { useWorkspaceStore } from '@/stores/workspace.store'
import type { DocumentMeta } from '@/types/index'
import { formatDateTime } from '@/utils/date'

const WORKBENCH_CARD_CLASS = 'rounded-[1.75rem] border border-border/70 bg-background/86 p-4 shadow-sm'
const WORKBENCH_PANEL_HEADER_CLASS = 'flex items-start justify-between gap-3'
const WORKBENCH_PANEL_BADGE_CLASS =
	'inline-flex h-8 min-w-24 shrink-0 items-center justify-center rounded-full border border-border/70 bg-card/90 px-4 text-xs font-medium text-muted-foreground'
const WORKBENCH_ACTIONS_CLASS = 'flex min-w-0 items-center justify-end gap-3'
const TOPBAR_LEFT_GROUP_CLASS = 'flex min-w-0 items-center gap-6'
const TOPBAR_TITLE_GROUP_CLASS = 'flex min-w-0 items-center gap-4'
const DOCUMENT_META_ROW_CLASS = 'mt-3 flex flex-wrap gap-2'

type WorkbenchPanelProps = {
	icon: LucideIcon
	title: string
	description: string
	badge: string
	children: ReactNode
	className?: string
	bodyClassName?: string
}

function WorkbenchPanel({
	icon: Icon,
	title,
	description,
	badge,
	children,
	className,
	bodyClassName,
}: WorkbenchPanelProps) {
	return (
		<section className={cn(WORKBENCH_CARD_CLASS, className)}>
			<div className={WORKBENCH_PANEL_HEADER_CLASS}>
				<div className='flex min-w-0 items-center gap-3'>
					<div className='flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
						<Icon />
					</div>
					<div className='min-w-0'>
						<h3 className='truncate text-sm font-semibold'>{title}</h3>
						<p className='mt-1 text-sm leading-6 text-muted-foreground'>{description}</p>
					</div>
				</div>
				<div className={WORKBENCH_PANEL_BADGE_CLASS}>{badge}</div>
			</div>

			<div className={cn('mt-4 min-w-0', bodyClassName)}>{children}</div>
		</section>
	)
}

function WorkspaceMetaPill({ label, value }: { label: string; value: string }) {
	return (
		<div className='inline-flex h-8 items-center rounded-full border border-border/70 bg-card/90 px-3 text-xs text-muted-foreground'>
			<span className='truncate'>
				{label}：{value}
			</span>
		</div>
	)
}

function WorkspacePage() {
	const navigate = useNavigate()
	const { openConfirmDialog } = useDialogHost()
	const documents = useWorkspaceStore((state) => state.documents)
	const recentDocuments = useWorkspaceStore((state) => state.recentDocuments)
	const trashedDocuments = useWorkspaceStore((state) => state.trashedDocuments)
	const documentsStatus = useWorkspaceStore((state) => state.documentsStatus)
	const documentsErrorMessage = useWorkspaceStore((state) => state.documentsErrorMessage)
	const startDocumentsLoading = useWorkspaceStore((state) => state.startDocumentsLoading)
	const completeDocumentsLoading = useWorkspaceStore((state) => state.completeDocumentsLoading)
	const failDocumentsLoading = useWorkspaceStore((state) => state.failDocumentsLoading)
	const setSelectedDocumentId = useWorkspaceStore((state) => state.setSelectedDocumentId)
	const localDirectoryStatus = useAppStore((state) => state.localDirectoryStatus)
	const localDirectories = useAppStore((state) => state.localDirectories)
	const localDirectoriesReadyAt = useAppStore((state) => state.localDirectoriesReadyAt)
	const databaseStatus = useAppStore((state) => state.databaseStatus)
	const databaseHealth = useAppStore((state) => state.databaseHealth)
	const databaseReadyAt = useAppStore((state) => state.databaseReadyAt)
	const [isCreating, setIsCreating] = useState(false)
	const [expandedDocumentId, setExpandedDocumentId] = useState<string | null>(null)
	const [editingDocumentId, setEditingDocumentId] = useState<string | null>(null)
	const [renameDraft, setRenameDraft] = useState('')
	const [pendingDocumentId, setPendingDocumentId] = useState<string | null>(null)
	const [searchDraft, setSearchDraft] = useState('')
	const deferredSearchDraft = useDeferredValue(searchDraft)

	const normalizedSearchDraft = useMemo(() => deferredSearchDraft.trim().toLowerCase(), [deferredSearchDraft])

	const filteredDocuments = useMemo(() => {
		if (!normalizedSearchDraft) {
			return documents
		}

		return documents.filter((document) => {
			const title = document.title.toLowerCase()
			const scenePath = document.currentScenePath.toLowerCase()
			return title.includes(normalizedSearchDraft) || scenePath.includes(normalizedSearchDraft)
		})
	}, [documents, normalizedSearchDraft])

	const filteredRecentDocuments = useMemo(() => {
		if (!normalizedSearchDraft) {
			return recentDocuments
		}

		return recentDocuments.filter((document) => {
			const title = document.title.toLowerCase()
			const scenePath = document.currentScenePath.toLowerCase()
			return title.includes(normalizedSearchDraft) || scenePath.includes(normalizedSearchDraft)
		})
	}, [normalizedSearchDraft, recentDocuments])

	const filteredTrashedDocuments = useMemo(() => {
		if (!normalizedSearchDraft) {
			return trashedDocuments
		}

		return trashedDocuments.filter((document) => {
			const title = document.title.toLowerCase()
			const scenePath = document.currentScenePath.toLowerCase()
			return title.includes(normalizedSearchDraft) || scenePath.includes(normalizedSearchDraft)
		})
	}, [normalizedSearchDraft, trashedDocuments])

	const hasDocuments = filteredDocuments.length > 0
	const hasTrashedDocuments = filteredTrashedDocuments.length > 0
	const hasSearchQuery = normalizedSearchDraft.length > 0
	const documentCountLabel = useMemo(() => {
		if (!hasSearchQuery) {
			return `${documents.length} 个文档`
		}

		return `${filteredDocuments.length} / ${documents.length} 个文档`
	}, [documents.length, filteredDocuments.length, hasSearchQuery])
	const recentCountLabel = useMemo(() => {
		if (!hasSearchQuery) {
			return `${recentDocuments.length} 条记录`
		}

		return `${filteredRecentDocuments.length} / ${recentDocuments.length} 条记录`
	}, [filteredRecentDocuments.length, hasSearchQuery, recentDocuments.length])
	const trashedCountLabel = useMemo(() => {
		if (!hasSearchQuery) {
			return `${trashedDocuments.length} 个已删除`
		}

		return `${filteredTrashedDocuments.length} / ${trashedDocuments.length} 个已删除`
	}, [filteredTrashedDocuments.length, hasSearchQuery, trashedDocuments.length])

	const resetInlineActionState = useCallback(() => {
		setExpandedDocumentId(null)
		setEditingDocumentId(null)
		setRenameDraft('')
	}, [])

	const loadWorkspaceData = useCallback(async () => {
		startDocumentsLoading()

		const [documentsResult, recentDocumentsResult, trashedDocumentsResult] = await Promise.all([
			documentService.list(),
			documentService.listRecent(),
			documentService.listTrashed(),
		])

		if (!documentsResult.ok) {
			failDocumentsLoading(documentsResult.error.message)
			return
		}

		if (!recentDocumentsResult.ok) {
			failDocumentsLoading(recentDocumentsResult.error.message)
			return
		}

		if (!trashedDocumentsResult.ok) {
			failDocumentsLoading(trashedDocumentsResult.error.message)
			return
		}

		completeDocumentsLoading({
			documents: documentsResult.data,
			recentDocuments: recentDocumentsResult.data,
			trashedDocuments: trashedDocumentsResult.data,
		})
	}, [completeDocumentsLoading, failDocumentsLoading, startDocumentsLoading])

	useEffect(() => {
		void loadWorkspaceData()
	}, [loadWorkspaceData])

	async function handleCreateDocument() {
		setIsCreating(true)

		const result = await documentService.create('未命名文档')

		setIsCreating(false)

		if (!result.ok) {
			toast.error(result.error.message)
			return
		}

		completeDocumentsLoading({
			documents: [result.data, ...documents.filter((item) => item.id !== result.data.id)],
			recentDocuments,
			trashedDocuments,
		})
		setSelectedDocumentId(result.data.id)
		navigate(buildEditorRoute(result.data.id))
	}

	async function handleOpenDocument(documentId: string) {
		const result = await documentService.open(documentId)

		if (!result.ok) {
			toast.error(result.error.message)
			return
		}

		setSelectedDocumentId(result.data.id)
		navigate(buildEditorRoute(result.data.id))
	}

	function handleDocumentCardKeyDown(event: KeyboardEvent<HTMLDivElement>, documentId: string) {
		if (event.key !== 'Enter' && event.key !== ' ') {
			return
		}

		event.preventDefault()
		void handleOpenDocument(documentId)
	}

	function toggleDocumentActions(documentId: string) {
		if (expandedDocumentId === documentId) {
			resetInlineActionState()
			return
		}

		setExpandedDocumentId(documentId)
		setEditingDocumentId(null)
		setRenameDraft('')
	}

	function beginRenameDocument(document: DocumentMeta) {
		setExpandedDocumentId(document.id)
		setEditingDocumentId(document.id)
		setRenameDraft(document.title)
	}

	async function handleRenameDocument(documentId: string) {
		const normalizedTitle = renameDraft.trim()

		if (!normalizedTitle) {
			toast.error('标题不能为空。')
			return
		}

		setPendingDocumentId(documentId)
		const result = await documentService.rename(documentId, normalizedTitle)
		setPendingDocumentId(null)

		if (!result.ok) {
			toast.error(result.error.message)
			return
		}

		resetInlineActionState()
		await loadWorkspaceData()
		toast.success('文档标题已更新。')
	}

	async function executeMoveToTrash(document: DocumentMeta) {
		setPendingDocumentId(document.id)
		const result = await documentService.moveToTrash(document.id)
		setPendingDocumentId(null)

		if (!result.ok) {
			toast.error(result.error.message)
			return
		}

		resetInlineActionState()
		await loadWorkspaceData()
		toast.success(`已将《${document.title}》移动到回收站。`)
	}

	function handleMoveToTrash(document: DocumentMeta) {
		openConfirmDialog({
			title: '删除到回收站',
			description: `确认将《${document.title}》移动到回收站吗？当前版本不会永久删除，可在工作区内恢复。`,
			confirmLabel: '移入回收站',
			cancelLabel: '取消',
			onConfirm: () => {
				void executeMoveToTrash(document)
			},
		})
	}

	async function handleRestoreDocument(document: DocumentMeta) {
		setPendingDocumentId(document.id)
		const result = await documentService.restore(document.id)
		setPendingDocumentId(null)

		if (!result.ok) {
			toast.error(result.error.message)
			return
		}

		await loadWorkspaceData()
		toast.success(`已恢复《${document.title}》。`)
	}

	return (
		<WorkbenchLayout
			topbar={
				<SceneTopbar
					left={
						<div className={TOPBAR_LEFT_GROUP_CLASS}>
							<div className='flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
								<FolderKanbanIcon />
							</div>
							<div className={TOPBAR_TITLE_GROUP_CLASS}>
								<h1 className='truncate text-lg font-semibold tracking-tight'>工作台</h1>
								<span className='inline-flex h-8 items-center justify-center rounded-full border border-border/70 bg-card/90 px-4 text-xs font-medium text-muted-foreground'>
									{documentCountLabel}
								</span>
							</div>
						</div>
					}
					center={
						<div className='relative w-full'>
							<SearchIcon className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
							<Input
								type='search'
								className={SCENE_TOPBAR_SEARCH_INPUT_CLASS}
								value={searchDraft}
								onChange={(event) => {
									setSearchDraft(event.target.value)
								}}
								placeholder='搜索文档标题或路径'
							/>
						</div>
					}
					right={
						<div className={WORKBENCH_ACTIONS_CLASS}>
							<Button
								type='button'
								size='lg'
								disabled={isCreating}
								onClick={() => {
									void handleCreateDocument()
								}}>
								<FilePlus2Icon data-icon='inline-start' />
								{isCreating ? '正在创建' : '新建文档'}
							</Button>
							<Button
								type='button'
								size='lg'
								variant='outline'
								onClick={() => {
									void loadWorkspaceData()
								}}>
								<RefreshCwIcon data-icon='inline-start' />
								刷新
							</Button>
							<Button
								type='button'
								size='icon-lg'
								variant='outline'
								className='rounded-2xl bg-white/80'
								title='设置'
								onClick={() => {
									navigate(APP_ROUTES.SETTINGS)
								}}>
								<Settings2Icon />
							</Button>
						</div>
					}
				/>
			}
			primary={
				<WorkbenchPanel
					icon={LayoutGridIcon}
					title='本地文档'
					description='围绕真实文档操作组织主列表，只保留打开、重命名和回收站动作。'
					badge={documentCountLabel}
					className='flex min-h-0 flex-1 flex-col overflow-hidden'
					bodyClassName='min-h-0 flex-1 overflow-y-auto scrollbar-hidden pr-1'>
					{documentsStatus === 'loading' ? (
						<div className='flex min-h-72 items-center justify-center rounded-lg border border-dashed border-border/80 bg-card/70 px-6 py-10 text-sm text-muted-foreground'>
							正在读取文档列表...
						</div>
					) : null}

					{documentsStatus === 'error' ? (
						<EmptyState
							actionLabel='重新加载'
							description={documentsErrorMessage ?? '文档列表读取失败，请重新加载。'}
							icon={FolderOpenIcon}
							onAction={() => {
								void loadWorkspaceData()
							}}
							title='文档列表读取失败'
						/>
					) : null}

					{documentsStatus === 'ready' && !hasDocuments ? (
						<EmptyState
							actionLabel={hasSearchQuery ? undefined : '新建第一份文档'}
							description={
								hasSearchQuery
									? '没有匹配当前搜索条件的文档，试试更短的标题关键词或路径片段。'
									: '当前工作台还没有本地文档。现在可以直接从右上角新建。'
							}
							icon={FileStackIcon}
							onAction={
								hasSearchQuery
									? undefined
									: () => {
											void handleCreateDocument()
										}
							}
							title={hasSearchQuery ? '没有搜索结果' : '还没有文档'}
						/>
					) : null}

					{documentsStatus === 'ready' && hasDocuments ? (
						<div className='grid gap-3'>
							{filteredDocuments.map((document) => {
								const isExpanded = expandedDocumentId === document.id
								const isEditing = editingDocumentId === document.id
								const isPending = pendingDocumentId === document.id

								return (
									<div
										key={document.id}
										role='button'
										tabIndex={0}
										className='cursor-pointer rounded-lg border border-border bg-card/88 p-4 shadow-xs transition-[background-color,border-color,box-shadow,transform] hover:border-primary/45 hover:bg-card hover:shadow-md hover:shadow-primary/8'
										onClick={() => {
											void handleOpenDocument(document.id)
										}}
										onKeyDown={(event) => {
											handleDocumentCardKeyDown(event, document.id)
										}}>
										<div className='flex items-start justify-between gap-3'>
											<div className='min-w-0 flex-1'>
												<p className='truncate text-sm font-semibold'>{document.title}</p>
											</div>
											<div className='flex shrink-0 items-center gap-2'>
												<Button
													type='button'
													size='icon'
													variant='outline'
													className='rounded-xl bg-white/80'
													disabled={isPending}
													title='更多操作'
													onClick={(event) => {
														event.stopPropagation()
														toggleDocumentActions(document.id)
													}}>
													<MoreHorizontalIcon />
												</Button>
											</div>
										</div>

										<div className={DOCUMENT_META_ROW_CLASS}>
											<WorkspaceMetaPill
												label='创建'
												value={formatDateTime(document.createdAt)}
											/>
											<WorkspaceMetaPill
												label='更新'
												value={formatDateTime(document.updatedAt)}
											/>
										</div>

										{isExpanded ? (
											<div
												className='mt-4 rounded-[1.25rem] border border-border/70 bg-background/82 p-3'
												onClick={(event) => {
													event.stopPropagation()
												}}
												onKeyDown={(event) => {
													event.stopPropagation()
												}}>
												{isEditing ? (
													<div className='flex flex-col gap-3'>
														<Input
															value={renameDraft}
															maxLength={120}
															disabled={isPending}
															onChange={(event) => {
																setRenameDraft(event.target.value)
															}}
															placeholder='输入新的文档标题'
														/>
														<div className='flex flex-wrap gap-2'>
															<Button
																type='button'
																size='default'
																disabled={isPending}
																onClick={() => {
																	void handleRenameDocument(document.id)
																}}>
																<PencilLineIcon data-icon='inline-start' />
																保存标题
															</Button>
															<Button
																type='button'
																size='default'
																variant='outline'
																disabled={isPending}
																onClick={() => {
																	setEditingDocumentId(null)
																	setRenameDraft('')
																}}>
																取消
															</Button>
														</div>
													</div>
												) : (
													<div className='flex flex-wrap gap-2'>
														<Button
															type='button'
															size='default'
															variant='outline'
															disabled={isPending}
															onClick={() => {
																beginRenameDocument(document)
															}}>
															<PencilLineIcon data-icon='inline-start' />
															重命名
														</Button>
														<Button
															type='button'
															size='default'
															variant='outline'
															disabled={isPending}
															onClick={() => {
																handleMoveToTrash(document)
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
					) : null}
				</WorkbenchPanel>
			}
			secondary={
				<div className='flex min-h-0 flex-col gap-4 overflow-y-auto scrollbar-hidden pr-1'>
					<WorkbenchPanel
						icon={Clock3Icon}
						title='最近打开'
						description='按最近打开时间回到上次编辑位置。'
						badge={recentCountLabel}>
						{filteredRecentDocuments.length > 0 ? (
							<div className='grid gap-3'>
								{filteredRecentDocuments.map((document) => (
									<button
										key={document.id}
										type='button'
										className='rounded-[1.25rem] border border-border/70 bg-card/90 px-4 py-3 text-left text-sm transition-colors hover:bg-accent/35'
										onClick={() => {
											void handleOpenDocument(document.id)
										}}>
										<p className='font-medium'>{document.title}</p>
										<p className='mt-1 text-xs text-muted-foreground'>
											最近打开：{document.lastOpenedAt ? formatDateTime(document.lastOpenedAt) : '尚未记录'}
										</p>
									</button>
								))}
							</div>
						) : (
							<EmptyState
								description={
									hasSearchQuery
										? '当前搜索条件下没有最近打开记录。'
										: '当前还没有最近打开记录。进入过编辑器后，这里会自动出现真实文档。'
								}
								icon={Clock3Icon}
								title={hasSearchQuery ? '没有搜索结果' : '最近打开为空'}
							/>
						)}
					</WorkbenchPanel>

					<WorkbenchPanel
						icon={RotateCcwIcon}
						title='回收站'
						description='只保留恢复入口，不再拆独立页面。'
						badge={trashedCountLabel}>
						{hasTrashedDocuments ? (
							<div className='grid gap-3'>
								{filteredTrashedDocuments.map((document) => {
									const isPending = pendingDocumentId === document.id

									return (
										<div
											key={document.id}
											className='rounded-[1.25rem] border border-border/70 bg-card/90 px-4 py-3 text-sm'>
											<p className='font-medium'>{document.title}</p>
											<p className='mt-1 text-xs text-muted-foreground'>
												删除时间：{document.deletedAt ? formatDateTime(document.deletedAt) : '未记录'}
											</p>
											<div className='mt-3'>
												<Button
													type='button'
													size='default'
													variant='outline'
													disabled={isPending}
													onClick={() => {
														void handleRestoreDocument(document)
													}}>
													<RotateCcwIcon data-icon='inline-start' />
													恢复文档
												</Button>
											</div>
										</div>
									)
								})}
							</div>
						) : (
							<EmptyState
								description={
									hasSearchQuery
										? '当前搜索条件下没有回收站文档。'
										: '当前没有已删除文档。删除到回收站后的文档会在这里出现。'
								}
								icon={RotateCcwIcon}
								title={hasSearchQuery ? '没有搜索结果' : '回收站为空'}
							/>
						)}
					</WorkbenchPanel>

					<WorkbenchPanel
						icon={DatabaseZapIcon}
						title='系统状态'
						description='保留必要的本地目录与数据库诊断信息，用于辅助排查。'
						badge='运行状态'>
						<div className='grid gap-3'>
							<div className='grid gap-3'>
								<div className='rounded-[1.25rem] border border-border/70 bg-card/90 px-4 py-3'>
									<p className='text-xs text-muted-foreground'>目录状态</p>
									<p className='mt-1 text-sm font-medium'>{localDirectoryStatus}</p>
								</div>
								<div className='rounded-[1.25rem] border border-border/70 bg-card/90 px-4 py-3'>
									<p className='text-xs text-muted-foreground'>数据库状态</p>
									<p className='mt-1 text-sm font-medium'>{databaseStatus}</p>
								</div>
							</div>
							<div className='rounded-[1.25rem] border border-border/70 bg-card/90 px-4 py-3'>
								<p className='text-xs text-muted-foreground'>目录最近就绪时间</p>
								<p className='mt-1 text-sm font-medium'>{localDirectoriesReadyAt ?? '尚未完成目录初始化'}</p>
							</div>
							<div className='rounded-[1.25rem] border border-border/70 bg-card/90 px-4 py-3'>
								<p className='text-xs text-muted-foreground'>数据库最近就绪时间</p>
								<p className='mt-1 text-sm font-medium'>{databaseReadyAt ?? '尚未完成数据库初始化'}</p>
							</div>
							<div className='rounded-[1.25rem] border border-border/70 bg-card/90 px-4 py-3'>
								<p className='text-xs text-muted-foreground'>文档目录</p>
								<p className='mt-1 break-all text-sm font-medium'>
									{localDirectories?.documentsDir.path ?? '等待目录初始化'}
								</p>
							</div>
							<div className='rounded-[1.25rem] border border-border/70 bg-card/90 px-4 py-3'>
								<p className='text-xs text-muted-foreground'>数据库文件</p>
								<p className='mt-1 break-all text-sm font-medium'>
									{databaseHealth?.databasePath ?? '等待数据库初始化'}
								</p>
							</div>
							<div className='rounded-[1.25rem] border border-border/70 bg-card/90 px-4 py-3'>
								<p className='text-xs text-muted-foreground'>schema 版本</p>
								<p className='mt-1 text-sm font-medium'>
									{databaseHealth?.schemaVersion ?? '未初始化'} / {databaseHealth?.targetSchemaVersion ?? '未初始化'}
								</p>
							</div>
						</div>
					</WorkbenchPanel>
				</div>
			}
		/>
	)
}

export default WorkspacePage
