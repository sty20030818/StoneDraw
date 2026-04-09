import { useMemo, useState } from 'react'
import { FileStackIcon, Grid2x2Icon, Layers3Icon, ListIcon } from 'lucide-react'
import { EmptyState, WorkspacePageShell } from '@/shared/components'
import { DocumentListItem } from '@/features/documents'
import { useOverlayStore } from '@/features/overlays'
import {
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	Skeleton,
	Tabs,
	TabsList,
	TabsTrigger,
} from '@/shared/ui'
import { useWorkspaceDocuments } from '@/features/workspace/hooks'
import { useWorkspaceStore } from '@/features/workspace/state'
import { resolveDocumentCategory, sortDocumentsByLastOpened } from '@/features/documents/ui/document-ui'

function DocumentListSkeleton() {
	return (
		<div className='space-y-3'>
			<div className='hidden gap-3 px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid md:grid-cols-[2.5rem_minmax(0,1.7fr)_8.5rem_8.5rem_7.5rem_3rem] md:items-center'>
				<span />
				<span>文档名称</span>
				<span>分类标签</span>
				<span>最近更新</span>
				<span>状态</span>
				<span className='text-right' />
			</div>
			<div className='overflow-hidden rounded-lg border bg-card shadow-sm'>
				<div className='grid gap-px bg-border'>
				{Array.from({ length: 5 }).map((_, index) => (
					<div
						key={index}
						className='grid gap-3 bg-background px-4 py-3.5 md:grid-cols-[2.5rem_minmax(0,1.7fr)_8.5rem_8.5rem_7.5rem_3rem] md:items-center'>
						<Skeleton className='mx-auto size-5 rounded-full' />
						<div className='flex items-center gap-3'>
							<Skeleton className='size-10 rounded-md' />
							<div className='space-y-2'>
								<Skeleton className='h-4 w-44 max-w-full' />
								<Skeleton className='h-3 w-28 max-w-full' />
							</div>
						</div>
						<Skeleton className='h-7 w-18 rounded-full' />
						<Skeleton className='h-4 w-20' />
						<Skeleton className='h-4 w-18' />
						<div className='flex justify-end'>
							<Skeleton className='size-7 rounded-lg' />
						</div>
					</div>
				))}
				</div>
			</div>
		</div>
	)
}

type DocumentSegment = 'all' | 'recent' | 'starred'
type DocumentViewMode = 'list' | 'grid'

function DocumentsPage() {
	const documents = useWorkspaceStore((state) => state.documents)
	const collectionStatus = useWorkspaceStore((state) => state.collectionStatus)
	const collectionErrorMessage = useWorkspaceStore((state) => state.collectionErrorMessage)
	const openNewDocumentDialog = useOverlayStore((state) => state.openNewDocumentDialog)
	const [activeSegment, setActiveSegment] = useState<DocumentSegment>('all')
	const [activeCategoryLabel, setActiveCategoryLabel] = useState('分类：全部')
	const [viewMode, setViewMode] = useState<DocumentViewMode>('list')
	const { loadWorkspaceData, handleOpenDocument, handleRenameDocument, handleMoveToTrash } = useWorkspaceDocuments()

	const recentDocuments = useMemo(() => sortDocumentsByLastOpened(documents), [documents])
	const categoryOptions = useMemo(() => {
		const uniqueCategories = new Set(documents.map((document) => resolveDocumentCategory(document.title)))
		return ['分类：全部', ...Array.from(uniqueCategories).map((category) => `分类：${category}`)]
	}, [documents])

	const visibleDocuments = useMemo(() => {
		if (activeSegment === 'recent') {
			return recentDocuments
		}

		if (activeSegment === 'starred') {
			return []
		}

		return documents
	}, [activeSegment, documents, recentDocuments])

	const emptyStateMeta = useMemo(() => {
		if (activeSegment === 'starred') {
			return {
				title: '收藏能力待接入',
				description: '当前先保留“已收藏”作为文档页筛选位，后续接入真实收藏数据后这里会展示已标记文档。',
				actionLabel: '返回全部图纸',
				onAction: () => {
					setActiveSegment('all')
				},
			}
		}

		if (activeSegment === 'recent') {
			return {
				title: '还没有最近打开记录',
				description: '当文档被打开后，这里会按最近打开时间聚合最近继续工作的内容。',
				actionLabel: '查看全部图纸',
				onAction: () => {
					setActiveSegment('all')
				},
			}
		}

		return {
			title: '还没有文档',
			description: 'Documents 页面现在已经成为正式文档主库入口，可以直接从这里创建第一份文档。',
			actionLabel: '新建第一份文档',
			onAction: () => {
				openNewDocumentDialog({
					source: 'workspace-page',
				})
			},
		}
	}, [activeSegment, openNewDocumentDialog])

	return (
		<WorkspacePageShell>
			<div className='animate-in fade-in duration-300'>
				<div className='mb-5 overflow-x-auto pb-1'>
					<div className='flex min-w-max items-center justify-between gap-2.5'>
						<Tabs
							value={activeSegment}
							onValueChange={(value) => {
								setActiveSegment(value as DocumentSegment)
							}}
							className='gap-0'>
							<TabsList className='w-fit gap-0.5 rounded-lg border bg-muted/50 p-1 shadow-sm'>
								<TabsTrigger
									value='all'
									className='min-w-24 rounded-md px-4 py-1.5 text-[13px] font-semibold'>
									全部图纸
								</TabsTrigger>
								<TabsTrigger
									value='recent'
									className='min-w-24 rounded-md px-4 py-1.5 text-[13px] font-semibold'>
									最近打开
								</TabsTrigger>
								<TabsTrigger
									value='starred'
									className='min-w-20 rounded-md px-4 py-1.5 text-[13px] font-semibold'>
									已收藏
								</TabsTrigger>
							</TabsList>
						</Tabs>

						<div className='ml-2 flex items-center gap-2'>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										type='button'
										variant='outline'
										size='sm'
										className='h-9 rounded-lg bg-card px-3 shadow-sm'>
										<Layers3Icon data-icon='inline-start' />
										{activeCategoryLabel}
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align='end'>
									{categoryOptions.map((option) => (
										<DropdownMenuItem
											key={option}
											onSelect={() => {
												setActiveCategoryLabel(option)
											}}>
											{option}
										</DropdownMenuItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>

							<Tabs
								value={viewMode}
								onValueChange={(value) => {
									setViewMode(value as DocumentViewMode)
								}}
								className='gap-0'>
								<TabsList
									variant='ghost'
									className='h-9 gap-0.5 rounded-lg border bg-card p-1 shadow-sm'>
									<TabsTrigger
										value='grid'
										title='网格视图站位'
										className='size-7 min-h-0 rounded-md p-0'>
										<Grid2x2Icon className='size-3.5' />
									</TabsTrigger>
									<TabsTrigger
										value='list'
										title='列表视图'
										className='size-7 min-h-0 rounded-md p-0'>
										<ListIcon className='size-3.5' />
									</TabsTrigger>
								</TabsList>
							</Tabs>
						</div>
					</div>
				</div>

				{collectionStatus === 'loading' ? <DocumentListSkeleton /> : null}

				{collectionStatus === 'error' ? (
					<EmptyState
						title='文档列表读取失败'
						description={collectionErrorMessage ?? '文档列表读取失败，请重新加载。'}
						icon={FileStackIcon}
						actionLabel='重新加载'
						onAction={() => {
							void loadWorkspaceData()
						}}
					/>
				) : null}

				{collectionStatus === 'ready' && visibleDocuments.length === 0 ? (
					<EmptyState
						title={emptyStateMeta.title}
						description={emptyStateMeta.description}
						icon={FileStackIcon}
						actionLabel={emptyStateMeta.actionLabel}
						onAction={emptyStateMeta.onAction}
					/>
				) : null}

				{collectionStatus === 'ready' && visibleDocuments.length > 0 ? (
					<div className='space-y-3'>
						<div className='hidden gap-3 px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid md:grid-cols-[2.5rem_minmax(0,1.7fr)_8.5rem_8.5rem_7.5rem_3rem] md:items-center'>
							<span />
							<span>文档名称</span>
							<span>分类标签</span>
							<span>最近更新</span>
							<span>状态</span>
							<span className='text-right' />
						</div>
						<div className='overflow-hidden rounded-lg border bg-card shadow-sm'>
						<div className='divide-y'>
							{visibleDocuments.map((document) => (
								<DocumentListItem
									key={document.id}
									document={document}
									onOpen={(documentId) => {
										void handleOpenDocument(documentId)
									}}
									onRename={handleRenameDocument}
									onMoveToTrash={handleMoveToTrash}
								/>
							))}
						</div>
						</div>
					</div>
				) : null}
			</div>
		</WorkspacePageShell>
	)
}

export default DocumentsPage
