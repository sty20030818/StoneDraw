import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
	ArrowRightIcon,
	Clock3Icon,
	DatabaseZapIcon,
	FilePlus2Icon,
	FileStackIcon,
	FolderOpenIcon,
	LayoutGridIcon,
	MoreHorizontalIcon,
	PencilLineIcon,
	RefreshCwIcon,
	RotateCcwIcon,
	SearchIcon,
	Trash2Icon,
} from 'lucide-react'
import { toast } from 'sonner'
import { useDialogHost } from '@/components/feedback/DialogHost'
import EmptyState from '@/components/states/EmptyState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { APP_FEATURE_SCOPE, APP_STATUS_BADGE } from '@/constants'
import { APP_ROUTES, buildEditorRoute } from '@/constants/routes'
import { documentService } from '@/services'
import { useAppStore, useWorkspaceStore } from '@/stores'
import type { DocumentMeta } from '@/types'
import { formatDateTime } from '@/utils'

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

	const hasDocuments = documents.length > 0
	const hasTrashedDocuments = trashedDocuments.length > 0
	const documentCountLabel = useMemo(() => `${documents.length} 个文档`, [documents.length])
	const trashedCountLabel = useMemo(() => `${trashedDocuments.length} 个已删除`, [trashedDocuments.length])

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
		<div className='flex flex-col gap-5'>
			<section className='rounded-xl border border-border/70 bg-background/80 p-5 shadow-sm'>
				<div className='flex flex-col gap-3'>
					<span className='w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold tracking-[0.16em] text-primary uppercase'>
						{APP_STATUS_BADGE}
					</span>
					<div className='flex flex-col gap-2'>
						<h2 className='text-2xl font-semibold tracking-tight'>工作区页面 V1</h2>
						<p className='max-w-3xl text-sm leading-6 text-muted-foreground'>
							现在的工作区开始承担真实文档入口，而不是继续充当启动阶段的调试面板。文档列表、最近打开区块和顶部工具栏会成为后续
							`0.2.5` 到 `0.3.x` 的稳定承载面。
						</p>
					</div>
				</div>

				<Separator className='my-5' />

				<div className='flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between'>
					<div className='flex flex-1 flex-col gap-3 sm:flex-row sm:items-center'>
						<Button
							type='button'
							disabled={isCreating}
							onClick={() => {
								void handleCreateDocument()
							}}>
							<FilePlus2Icon data-icon='inline-start' />
							{isCreating ? '正在创建文档' : '新建文档'}
						</Button>
						<Button
							type='button'
							variant='outline'
							onClick={() => {
								void loadWorkspaceData()
							}}>
							<RefreshCwIcon data-icon='inline-start' />
							刷新列表
						</Button>
					</div>

					<div className='flex w-full flex-col gap-3 sm:flex-row xl:w-auto xl:min-w-120'>
						<div className='relative flex-1'>
							<SearchIcon className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
							<Input
								disabled
								className='h-10 rounded-xl pl-9'
								placeholder='搜索文档（0.2.5 之后接入真实搜索）'
								type='search'
							/>
						</div>
						<Button
							type='button'
							variant='ghost'
							onClick={() => {
								navigate(APP_ROUTES.SETTINGS)
							}}>
							<ArrowRightIcon data-icon='inline-start' />
							查看设置
						</Button>
					</div>
				</div>
			</section>

			<section className='grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]'>
				<div className='rounded-xl border border-border/70 bg-background/80 p-5 shadow-sm'>
					<div className='flex flex-wrap items-start justify-between gap-3'>
						<div className='flex items-center gap-3'>
							<div className='flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
								<LayoutGridIcon />
							</div>
							<div className='flex flex-col gap-1'>
								<h3 className='font-semibold'>本地文档</h3>
								<p className='text-sm text-muted-foreground'>按 `updatedAt DESC` 展示当前所有未删除文档。</p>
							</div>
						</div>
						<div className='rounded-full border border-border/70 bg-card px-3 py-1 text-xs font-medium text-muted-foreground'>
							{documentCountLabel}
						</div>
					</div>

					<div className='mt-4'>
						{documentsStatus === 'loading' ? (
							<div className='flex min-h-72 items-center justify-center rounded-3xl border border-dashed border-border/80 bg-card/70 px-6 py-10 text-sm text-muted-foreground'>
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
								actionLabel='新建第一份文档'
								description='当前工作区还没有本地文档。现在可以从顶部工具栏开始创建第一份文档。'
								icon={FileStackIcon}
								onAction={() => {
									void handleCreateDocument()
								}}
								title='还没有文档'
							/>
						) : null}

						{documentsStatus === 'ready' && hasDocuments ? (
							<div className='grid gap-3'>
								{documents.map((document) => {
									const isExpanded = expandedDocumentId === document.id
									const isEditing = editingDocumentId === document.id
									const isPending = pendingDocumentId === document.id

									return (
										<div
											key={document.id}
											className='rounded-2xl border border-border/70 bg-card/80 p-4 shadow-xs'>
											<div className='flex flex-wrap items-start justify-between gap-3'>
												<div className='flex flex-col gap-1'>
													<p className='text-sm font-semibold'>{document.title}</p>
													<p className='break-all text-xs text-muted-foreground'>{document.currentScenePath}</p>
												</div>
												<div className='flex items-center gap-2'>
													<Button
														type='button'
														size='sm'
														variant='ghost'
														disabled={isPending}
														title='更多操作'
														onClick={() => {
															toggleDocumentActions(document.id)
														}}>
														<MoreHorizontalIcon />
													</Button>
													<Button
														type='button'
														size='sm'
														disabled={isPending}
														onClick={() => {
															void handleOpenDocument(document.id)
														}}>
														<ArrowRightIcon data-icon='inline-start' />
														打开
													</Button>
												</div>
											</div>
											<div className='mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2 lg:grid-cols-4'>
												<span>文档 ID：{document.id}</span>
												<span>创建时间：{formatDateTime(document.createdAt)}</span>
												<span>更新时间：{formatDateTime(document.updatedAt)}</span>
												<span>保存状态：{document.saveStatus}</span>
											</div>

											{isExpanded ? (
												<div className='mt-4 rounded-2xl border border-border/70 bg-background/80 p-3'>
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
																	size='sm'
																	disabled={isPending}
																	onClick={() => {
																		void handleRenameDocument(document.id)
																	}}>
																	<PencilLineIcon data-icon='inline-start' />
																	保存标题
																</Button>
																<Button
																	type='button'
																	size='sm'
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
																size='sm'
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
																size='sm'
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
					</div>
				</div>

				<div className='flex flex-col gap-4'>
					<div className='rounded-xl border border-border/70 bg-background/80 p-5 shadow-sm'>
						<div className='flex items-center gap-3'>
							<div className='flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
								<Clock3Icon />
							</div>
							<div className='flex flex-col gap-1'>
								<h3 className='font-semibold'>最近打开</h3>
								<p className='text-sm text-muted-foreground'>读取真实 `recent_opens` 记录，并按最近打开时间倒序展示。</p>
							</div>
						</div>

						<div className='mt-4'>
							{recentDocuments.length > 0 ? (
								<div className='grid gap-3'>
									{recentDocuments.map((document) => (
										<button
											key={document.id}
											type='button'
											className='rounded-2xl border border-border/70 bg-card px-4 py-3 text-left text-sm'
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
									description='当前还没有最近打开记录。成功进入编辑器后，这里会自动出现真实文档。'
									icon={Clock3Icon}
									title='最近打开为空'
								/>
							)}
						</div>
					</div>

					<div className='rounded-xl border border-border/70 bg-background/80 p-5 shadow-sm'>
						<div className='flex items-center justify-between gap-3'>
							<div className='flex items-center gap-3'>
								<div className='flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
									<RotateCcwIcon />
								</div>
								<div className='flex flex-col gap-1'>
									<h3 className='font-semibold'>回收站</h3>
									<p className='text-sm text-muted-foreground'>保留最小恢复入口，不新增独立页面。</p>
								</div>
							</div>
							<div className='rounded-full border border-border/70 bg-card px-3 py-1 text-xs font-medium text-muted-foreground'>
								{trashedCountLabel}
							</div>
						</div>

						<div className='mt-4'>
							{hasTrashedDocuments ? (
								<div className='grid gap-3'>
									{trashedDocuments.map((document) => {
										const isPending = pendingDocumentId === document.id

										return (
											<div
												key={document.id}
												className='rounded-2xl border border-border/70 bg-card px-4 py-3 text-sm'>
												<p className='font-medium'>{document.title}</p>
												<p className='mt-1 text-xs text-muted-foreground'>
													删除时间：{document.deletedAt ? formatDateTime(document.deletedAt) : '未记录'}
												</p>
												<div className='mt-3'>
													<Button
														type='button'
														size='sm'
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
									description='当前没有已删除文档。删除到回收站后的文档会在这里出现。'
									icon={RotateCcwIcon}
									title='回收站为空'
								/>
							)}
						</div>
					</div>

					<div className='rounded-xl border border-border/70 bg-background/80 p-5 shadow-sm'>
						<div className='flex items-center gap-3'>
							<div className='flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
								<DatabaseZapIcon />
							</div>
							<div className='flex flex-col gap-1'>
								<h3 className='font-semibold'>本地诊断信息</h3>
								<p className='text-sm text-muted-foreground'>保留阶段性可观测性，但不再占据工作区主视觉。</p>
							</div>
						</div>

						<div className='mt-4 flex flex-col gap-3 rounded-lg border border-border/70 bg-card p-4'>
							<div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-1'>
								<div className='rounded-lg border border-border/70 bg-background px-4 py-3'>
									<p className='text-xs text-muted-foreground'>目录状态</p>
									<p className='mt-1 text-sm font-medium'>{localDirectoryStatus}</p>
								</div>
								<div className='rounded-lg border border-border/70 bg-background px-4 py-3'>
									<p className='text-xs text-muted-foreground'>数据库状态</p>
									<p className='mt-1 text-sm font-medium'>{databaseStatus}</p>
								</div>
							</div>
							<div className='grid gap-3'>
								<div className='rounded-lg border border-border/70 bg-background px-4 py-3'>
									<p className='text-xs text-muted-foreground'>目录最近就绪时间</p>
									<p className='mt-1 text-sm font-medium'>{localDirectoriesReadyAt ?? '尚未完成目录初始化'}</p>
								</div>
								<div className='rounded-lg border border-border/70 bg-background px-4 py-3'>
									<p className='text-xs text-muted-foreground'>数据库最近就绪时间</p>
									<p className='mt-1 text-sm font-medium'>{databaseReadyAt ?? '尚未完成数据库初始化'}</p>
								</div>
								<div className='rounded-lg border border-border/70 bg-background px-4 py-3'>
									<p className='text-xs text-muted-foreground'>文档目录</p>
									<p className='mt-1 break-all text-sm font-medium'>
										{localDirectories?.documentsDir.path ?? '等待目录初始化'}
									</p>
								</div>
								<div className='rounded-lg border border-border/70 bg-background px-4 py-3'>
									<p className='text-xs text-muted-foreground'>数据库文件</p>
									<p className='mt-1 break-all text-sm font-medium'>
										{databaseHealth?.databasePath ?? '等待数据库初始化'}
									</p>
								</div>
								<div className='rounded-lg border border-border/70 bg-background px-4 py-3'>
									<p className='text-xs text-muted-foreground'>schema 版本</p>
									<p className='mt-1 text-sm font-medium'>
										{databaseHealth?.schemaVersion ?? '未初始化'} / {databaseHealth?.targetSchemaVersion ?? '未初始化'}
									</p>
								</div>
							</div>
						</div>
					</div>

					<div className='rounded-xl border border-border/70 bg-background/80 p-5 shadow-sm'>
						<div className='flex items-center gap-3'>
							<div className='flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
								<FileStackIcon />
							</div>
							<div className='flex flex-col gap-1'>
								<h3 className='font-semibold'>当前版本覆盖范围</h3>
								<p className='text-sm text-muted-foreground'>继续作为阶段说明保留，但权重已经低于文档主入口。</p>
							</div>
						</div>

						<div className='mt-4 grid gap-3'>
							{APP_FEATURE_SCOPE.map((item) => (
								<div
									key={item}
									className='rounded-lg border border-border/70 bg-card px-4 py-3 text-sm font-medium shadow-xs'>
									{item}
								</div>
							))}
						</div>
					</div>
				</div>
			</section>
		</div>
	)
}

export default WorkspacePage
