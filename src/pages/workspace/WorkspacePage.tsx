import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
	ArrowRightIcon,
	DatabaseZapIcon,
	FilePlus2Icon,
	FileStackIcon,
	FolderOpenIcon,
	LayoutGridIcon,
	RefreshCwIcon,
} from 'lucide-react'
import EmptyState from '@/components/states/EmptyState'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { APP_FEATURE_SCOPE, APP_STATUS_BADGE } from '@/constants'
import { APP_ROUTES, buildEditorRoute } from '@/constants/routes'
import { documentService } from '@/services'
import { useAppStore, useWorkspaceStore } from '@/stores'
import { formatDateTime } from '@/utils'

type DocumentLoadStatus = 'loading' | 'ready' | 'error'

function WorkspacePage() {
	const navigate = useNavigate()
	const documents = useWorkspaceStore((state) => state.documents)
	const setDocuments = useWorkspaceStore((state) => state.setDocuments)
	const setSelectedDocumentId = useWorkspaceStore((state) => state.setSelectedDocumentId)
	const localDirectoryStatus = useAppStore((state) => state.localDirectoryStatus)
	const localDirectories = useAppStore((state) => state.localDirectories)
	const localDirectoriesReadyAt = useAppStore((state) => state.localDirectoriesReadyAt)
	const databaseStatus = useAppStore((state) => state.databaseStatus)
	const databaseHealth = useAppStore((state) => state.databaseHealth)
	const databaseReadyAt = useAppStore((state) => state.databaseReadyAt)
	const [documentLoadStatus, setDocumentLoadStatus] = useState<DocumentLoadStatus>('loading')
	const [documentLoadError, setDocumentLoadError] = useState<string | null>(null)
	const [isCreating, setIsCreating] = useState(false)

	const hasDocuments = documents.length > 0
	const documentCountLabel = useMemo(() => `${documents.length} 个文档`, [documents.length])

	const loadDocuments = useCallback(async () => {
		setDocumentLoadStatus('loading')
		setDocumentLoadError(null)

		const result = await documentService.list()

		if (!result.ok) {
			setDocuments([])
			setDocumentLoadStatus('error')
			setDocumentLoadError(result.error.message)
			return
		}

		setDocuments(result.data)
		setDocumentLoadStatus('ready')
	}, [setDocuments])

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

		const nextDocuments = [result.data, ...documents.filter((item) => item.id !== result.data.id)]
		setDocuments(nextDocuments)
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
			<section className='grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(20rem,0.75fr)]'>
				<div className='rounded-xl border border-border/70 bg-background/80 p-5 shadow-sm'>
					<div className='flex flex-col gap-3'>
						<span className='w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold tracking-[0.16em] text-primary uppercase'>
							{APP_STATUS_BADGE}
						</span>
						<div className='flex flex-col gap-2'>
							<h2 className='text-2xl font-semibold tracking-tight'>工作区已经切到真实文档列表</h2>
							<p className='max-w-2xl text-sm leading-6 text-muted-foreground'>
								当前版本开始通过 SQLite 元数据索引和 `current.scene.json` 驱动工作区，不再依赖前端 draft 占位对象。
							</p>
						</div>
					</div>

					<Separator className='my-5' />

					<div className='flex flex-wrap gap-3'>
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

				<div className='rounded-xl border border-border/70 bg-background/80 p-5 shadow-sm'>
					<div className='flex items-center gap-3'>
						<div className='flex size-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground'>
							<FolderOpenIcon />
						</div>
						<div className='flex flex-col gap-1'>
							<h3 className='font-semibold'>本地目录与数据库状态</h3>
							<p className='text-sm text-muted-foreground'>
								保留启动阶段信息，方便继续验证本地目录、SQLite 与 migration 的稳定性。
							</p>
						</div>
					</div>

					<div className='mt-4 flex flex-col gap-3 rounded-lg border border-border/70 bg-card p-4'>
						<div className='grid gap-3 sm:grid-cols-2'>
							<div className='rounded-lg border border-border/70 bg-background px-4 py-3'>
								<p className='text-xs text-muted-foreground'>目录状态</p>
								<p className='mt-1 text-sm font-medium'>{localDirectoryStatus}</p>
							</div>
							<div className='rounded-lg border border-border/70 bg-background px-4 py-3'>
								<p className='text-xs text-muted-foreground'>数据库状态</p>
								<p className='mt-1 text-sm font-medium'>{databaseStatus}</p>
							</div>
						</div>
						<div className='grid gap-3 sm:grid-cols-2'>
							<div className='rounded-lg border border-border/70 bg-background px-4 py-3'>
								<p className='text-xs text-muted-foreground'>目录最近就绪时间</p>
								<p className='mt-1 text-sm font-medium'>{localDirectoriesReadyAt ?? '尚未完成目录初始化'}</p>
							</div>
							<div className='rounded-lg border border-border/70 bg-background px-4 py-3'>
								<p className='text-xs text-muted-foreground'>数据库最近就绪时间</p>
								<p className='mt-1 text-sm font-medium'>{databaseReadyAt ?? '尚未完成数据库初始化'}</p>
							</div>
						</div>
						<div className='grid gap-3'>
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
						</div>
						<Separator />
						<div className='flex items-center gap-3 rounded-lg border border-border/70 bg-background px-4 py-3'>
							<div className='flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
								<DatabaseZapIcon />
							</div>
							<div className='flex flex-col gap-1 text-sm'>
								<p className='font-medium'>schema {databaseHealth?.schemaVersion ?? '未初始化'}</p>
								<p className='text-muted-foreground'>
									目标版本 {databaseHealth?.targetSchemaVersion ?? '未初始化'}
								</p>
							</div>
						</div>
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
						{documentLoadStatus === 'loading' ? (
							<div className='flex min-h-72 items-center justify-center rounded-3xl border border-dashed border-border/80 bg-card/70 px-6 py-10 text-sm text-muted-foreground'>
								正在读取文档列表...
							</div>
						) : null}

						{documentLoadStatus === 'error' ? (
							<EmptyState
								actionLabel='重新加载'
								description={documentLoadError ?? '文档列表读取失败，请重新加载。'}
								icon={FolderOpenIcon}
								onAction={() => {
									void loadDocuments()
								}}
								title='文档列表读取失败'
							/>
						) : null}

						{documentLoadStatus === 'ready' && !hasDocuments ? (
							<EmptyState
								actionLabel='新建第一份文档'
								description='当前工作区还没有本地文档。现在可以直接创建文档，并跳转到编辑器加载真实 scene。'
								icon={FileStackIcon}
								onAction={() => {
									void handleCreateDocument()
								}}
								title='还没有文档'
							/>
						) : null}

						{documentLoadStatus === 'ready' && hasDocuments ? (
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

				<div className='rounded-xl border border-border/70 bg-background/80 p-5 shadow-sm'>
					<div className='flex items-center gap-3'>
						<div className='flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
							<FileStackIcon />
						</div>
						<div className='flex flex-col gap-1'>
							<h3 className='font-semibold'>当前版本覆盖范围</h3>
							<p className='text-sm text-muted-foreground'>文档真实链路已经接上，后续继续叠加保存、恢复和回收站能力。</p>
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
			</section>
		</div>
	)
}

export default WorkspacePage
