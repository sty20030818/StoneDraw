import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FileStackIcon } from 'lucide-react'
import { EmptyState, PageSection, SectionHeader, WorkspacePageShell } from '@/shared/components'
import { DocumentListItem, DocumentListToolbar } from '@/features/documents'
import { useOverlayStore } from '@/features/overlays'
import { Button, Skeleton } from '@/shared/ui'
import { useWorkspaceDocuments } from '@/features/workspace/hooks'
import { useWorkspaceStore } from '@/features/workspace/state'

function DocumentListSkeleton() {
	return (
		<div className='overflow-hidden rounded-lg border bg-card'>
			<div className='grid gap-3 border-b bg-muted/30 px-4 py-3 md:grid-cols-[minmax(0,1.8fr)_10rem_6.5rem_3rem] md:items-center'>
				<Skeleton className='h-3 w-16' />
				<Skeleton className='h-3 w-12' />
				<Skeleton className='h-3 w-10' />
				<Skeleton className='ml-auto h-3 w-8' />
			</div>
			<div className='grid gap-px bg-border'>
				{Array.from({ length: 5 }).map((_, index) => (
					<div
						key={index}
						className='grid gap-3 bg-background px-4 py-3 md:grid-cols-[minmax(0,1.8fr)_10rem_6.5rem_3rem] md:items-center'>
						<div className='space-y-2'>
							<Skeleton className='h-4 w-40 max-w-full' />
							<Skeleton className='h-3 w-28 max-w-full' />
						</div>
						<Skeleton className='h-4 w-24' />
						<Skeleton className='h-5 w-16 rounded-full' />
						<div className='flex justify-end'>
							<Skeleton className='size-7 rounded-lg' />
						</div>
					</div>
				))}
			</div>
		</div>
	)
}

function DocumentsPage() {
	const [searchParams] = useSearchParams()
	const documents = useWorkspaceStore((state) => state.documents)
	const collectionStatus = useWorkspaceStore((state) => state.collectionStatus)
	const collectionErrorMessage = useWorkspaceStore((state) => state.collectionErrorMessage)
	const openNewDocumentDialog = useOverlayStore((state) => state.openNewDocumentDialog)
	const [searchDraft, setSearchDraft] = useState('')
	const deferredSearchDraft = useDeferredValue(searchDraft)
	const normalizedSearchDraft = useMemo(() => deferredSearchDraft.trim().toLowerCase(), [deferredSearchDraft])
	const { loadWorkspaceData, handleOpenDocument, handleRenameDocument, handleMoveToTrash } = useWorkspaceDocuments()

	useEffect(() => {
		setSearchDraft(searchParams.get('q') ?? '')
	}, [searchParams])

	const filteredDocuments = useMemo(() => {
		if (!normalizedSearchDraft) {
			return documents
		}

		return documents.filter((document) => {
			const title = document.title.toLowerCase()
			return title.includes(normalizedSearchDraft)
		})
	}, [documents, normalizedSearchDraft])

	const hasSearchQuery = normalizedSearchDraft.length > 0

	return (
		<WorkspacePageShell
			title='文档库'
			description='正式管理态主列表页，优先提供搜索、浏览、打开与文档级操作。'
			actions={<span className='text-xs text-muted-foreground'>{documents.length} 个文档</span>}
				toolbar={
					<DocumentListToolbar
						documentCount={documents.length}
						searchDraft={searchDraft}
					onSearchChange={setSearchDraft}
					onRefresh={() => {
						void loadWorkspaceData()
					}}
						onCreate={() => {
							openNewDocumentDialog({
								source: 'workspace-page',
							})
						}}
						viewControl={
							<Button
								type='button'
								variant='outline'
								size='sm'
								disabled>
								列表视图
							</Button>
						}
					/>
				}>
			<PageSection
				header={
					<SectionHeader
						title='文档列表'
						description='列表优先展示标题、更新时间、状态和操作入口。'
					/>
				}>
				{collectionStatus === 'loading' ? (
					<DocumentListSkeleton />
				) : null}

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

				{collectionStatus === 'ready' && filteredDocuments.length === 0 ? (
					<EmptyState
						title={hasSearchQuery ? '没有搜索结果' : '还没有文档'}
						description={
							hasSearchQuery
								? '当前搜索条件下没有匹配文档，试试更短的关键词或路径片段。'
								: 'Documents 页面现在已经成为正式文档主库入口，可以直接从这里创建第一份文档。'
						}
						icon={FileStackIcon}
						actionLabel='新建第一份文档'
						onAction={() => {
							openNewDocumentDialog({
								source: 'workspace-page',
							})
						}}
					/>
				) : null}

				{collectionStatus === 'ready' && filteredDocuments.length > 0 ? (
					<div className='overflow-hidden rounded-lg border bg-card'>
						<div className='grid gap-3 border-b bg-muted/30 px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid-cols-[minmax(0,1.8fr)_10rem_6.5rem_3rem] md:items-center'>
							<span>文档</span>
							<span>更新时间</span>
							<span>状态</span>
							<span className='text-right'>操作</span>
						</div>
						<div className='grid gap-px bg-border'>
							{filteredDocuments.map((document) => (
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
				) : null}
			</PageSection>
		</WorkspacePageShell>
	)
}

export default DocumentsPage
