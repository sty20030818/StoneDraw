import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FileStackIcon, RefreshCwIcon, SearchIcon } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import EmptyState from '@/shared/components/EmptyState'
import { WorkspaceDocumentCards } from '@/features/documents'
import { useOverlayStore } from '@/features/overlays'
import { useWorkspaceDocuments } from '@/features/workspace/hooks'
import { useWorkspaceStore } from '@/features/workspace/state'

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
		<div className='grid gap-5'>
			<section className='rounded-xl border bg-card p-5'>
				<div className='flex flex-wrap items-center justify-between gap-3'>
					<div className='relative min-w-64 flex-1'>
						<SearchIcon className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
						<Input
							type='search'
							className='pl-9'
							value={searchDraft}
							onChange={(event) => {
								setSearchDraft(event.target.value)
							}}
							placeholder='搜索文档标题或路径'
						/>
					</div>
					<div className='flex flex-wrap items-center gap-2'>
						<Button
							type='button'
							variant='outline'
							onClick={() => {
								void loadWorkspaceData()
							}}>
							<RefreshCwIcon data-icon='inline-start' />
							刷新列表
						</Button>
						<Button
							type='button'
							onClick={() => {
								openNewDocumentDialog({
									source: 'workspace-page',
								})
							}}>
							新建文档
						</Button>
					</div>
				</div>
			</section>

			{collectionStatus === 'loading' ? (
				<div className='rounded-xl border border-dashed bg-card px-6 py-10 text-sm text-muted-foreground'>
					正在读取 Documents 页面文档列表...
				</div>
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
				<WorkspaceDocumentCards
					documents={filteredDocuments}
					onOpen={(documentId) => {
						void handleOpenDocument(documentId)
					}}
					onRename={handleRenameDocument}
					onMoveToTrash={handleMoveToTrash}
				/>
			) : null}
		</div>
	)
}

export default DocumentsPage
