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
	RefreshCwIcon,
	SearchIcon,
} from 'lucide-react'
import EmptyState from '@/components/states/EmptyState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { APP_FEATURE_SCOPE, APP_STATUS_BADGE } from '@/constants'
import { APP_ROUTES, buildEditorRoute } from '@/constants/routes'
import { documentService } from '@/services'
import { useAppStore, useWorkspaceStore } from '@/stores'
import { formatDateTime } from '@/utils'

function WorkspacePage() {
	const navigate = useNavigate()
	const documents = useWorkspaceStore((state) => state.documents)
	const recentDocuments = useWorkspaceStore((state) => state.recentDocuments)
	const documentsStatus = useWorkspaceStore((state) => state.documentsStatus)
	const documentsErrorMessage = useWorkspaceStore((state) => state.documentsErrorMessage)
	const setRecentDocuments = useWorkspaceStore((state) => state.setRecentDocuments)
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

	const hasDocuments = documents.length > 0
	const documentCountLabel = useMemo(() => `${documents.length} 个文档`, [documents.length])

	const loadDocuments = useCallback(async () => {
		startDocumentsLoading()
		setRecentDocuments([])

		const result = await documentService.list()

		if (!result.ok) {
			failDocumentsLoading(result.error.message)
			return
		}

		completeDocumentsLoading(result.data)
	}, [completeDocumentsLoading, failDocumentsLoading, setRecentDocuments, startDocumentsLoading])

	useEffect(() => {
		void loadDocuments()
	}, [loadDocuments])

	async function handleCreateDocument() {
		setIsCreating(true)

		const result = await documentService.create('未命名文档')

		setIsCreating(false)

		if (!result.ok) {
			return
		}

		completeDocumentsLoading([result.data, ...documents.filter((item) => item.id !== result.data.id)])
		setSelectedDocumentId(result.data.id)
		navigate(buildEditorRoute(result.data.id))
	}

	async function handleOpenDocument(documentId: string) {
		const result = await documentService.open(documentId)

		if (!result.ok) {
			return
		}

		setSelectedDocumentId(result.data.id)
		navigate(buildEditorRoute(result.data.id))
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
								void loadDocuments()
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
									void loadDocuments()
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
								{documents.map((document) => (
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
													disabled
													title='更多操作将在 0.2.5 接入'>
													<MoreHorizontalIcon />
												</Button>
												<Button
													type='button'
													size='sm'
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
									</div>
								))}
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
								<p className='text-sm text-muted-foreground'>
									区块已经预留，真实 `recent_opens` 记录会在 `0.2.5` 接入。
								</p>
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
												最近更新时间：{formatDateTime(document.updatedAt)}
											</p>
										</button>
									))}
								</div>
							) : (
								<EmptyState
									description='当前版本先保留最近打开区块和空状态语义，不使用文档列表伪造最近打开记录。'
									icon={Clock3Icon}
									title='最近打开暂未接入'
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
