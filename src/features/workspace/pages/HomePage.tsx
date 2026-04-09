import { UploadCloud, Plus, LayoutTemplate, File, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { EmptyState, WorkspacePageShell } from '@/shared/components'
import { Card } from '@/shared/ui'
import { APP_ROUTES } from '@/shared/constants/routes'
import { useOverlayStore } from '@/features/overlays'
import { useWorkspaceDocuments } from '@/features/workspace/hooks'
import { useWorkspaceStore } from '@/features/workspace/state'

function resolveGreeting() {
	const hour = new Date().getHours()

	if (hour < 12) {
		return '上午好'
	}

	if (hour < 18) {
		return '下午好'
	}

	return '晚上好'
}

function formatRelativeTime(value: number | null) {
	if (!value) {
		return '尚未记录'
	}

	const now = Date.now()
	const diff = Math.max(0, now - value)
	const minute = 60 * 1000
	const hour = 60 * minute
	const day = 24 * hour

	if (diff < hour) {
		const minutes = Math.max(1, Math.floor(diff / minute))
		return minutes <= 1 ? '刚刚' : `${minutes} 分钟前`
	}

	if (diff < day) {
		const hours = Math.floor(diff / hour)
		return `${hours} 小时前`
	}

	if (diff < day * 2) {
		return '昨天'
	}

	return `${Math.floor(diff / day)} 天前`
}

function resolveDocumentCategory(title: string) {
	if (title.includes('架构') || title.includes('模块')) {
		return '架构'
	}

	if (title.includes('业务') || title.includes('流程')) {
		return '业务'
	}

	if (title.includes('PRD') || title.includes('产品')) {
		return '产品'
	}

	if (title.includes('数据库') || title.includes('后端')) {
		return '后端'
	}

	return '文档'
}

function HomePage() {
	const navigate = useNavigate()
	const recentDocuments = useWorkspaceStore((state) => state.recentDocuments)
	const collectionStatus = useWorkspaceStore((state) => state.collectionStatus)
	const openNewDocumentDialog = useOverlayStore((state) => state.openNewDocumentDialog)
	const { handleOpenDocument } = useWorkspaceDocuments()
	const greeting = resolveGreeting()

	return (
		<WorkspacePageShell>
			<div className='animate-in fade-in duration-300'>
				<div className='mb-7 space-y-1.5'>
					<h1 className='text-3xl font-black tracking-tight text-foreground'>{greeting}，石头鱼</h1>
					<p className='text-sm text-muted-foreground'>从空白文档、模板或本地导入快速开始，继续你最近的工作节奏。</p>
				</div>

				<div className='mb-10 grid grid-cols-1 gap-3 lg:grid-cols-3'>
					<button
						type='button'
						onClick={() => {
							openNewDocumentDialog({
								source: 'home-page',
							})
						}}
						className='group rounded-lg border bg-card px-4 py-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md'>
						<div className='mb-4 flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm'>
							<Plus className='size-4' />
						</div>
						<h2 className='text-lg font-bold tracking-tight text-foreground'>新建空白文档</h2>
						<p className='mt-2 text-sm leading-6 text-muted-foreground'>开启全新的画布创作</p>
					</button>

					<button
						type='button'
						onClick={() => {
							navigate(APP_ROUTES.WORKSPACE_TEMPLATES)
						}}
						className='group rounded-lg border bg-card px-4 py-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md'>
						<div className='mb-4 flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm'>
							<LayoutTemplate className='size-4' />
						</div>
						<h2 className='text-lg font-bold tracking-tight text-foreground'>从模板新建</h2>
						<p className='mt-2 text-sm leading-6 text-muted-foreground'>使用标准化结构提高效率</p>
					</button>

					<button
						type='button'
						onClick={() => {
							toast('导入能力还在接入中，下一步会补上真实文件导入链路。')
						}}
						className='group rounded-lg border bg-card px-4 py-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md'>
						<div className='mb-4 flex size-9 items-center justify-center rounded-xl bg-accent text-accent-foreground shadow-sm'>
							<UploadCloud className='size-4' />
						</div>
						<h2 className='text-lg font-bold tracking-tight text-foreground'>导入文件</h2>
						<p className='mt-2 text-sm leading-6 text-muted-foreground'>导入本地的 .excalidraw 存档</p>
					</button>
				</div>

				<div className='mb-4 flex items-center justify-between gap-4'>
					<h2 className='text-lg font-bold tracking-tight text-foreground'>近期活动</h2>
					<button
						type='button'
						className='text-sm font-medium text-primary transition-colors hover:text-primary/80'
						onClick={() => {
							navigate(APP_ROUTES.WORKSPACE_DOCUMENTS)
						}}>
						查看全部
					</button>
				</div>

				{collectionStatus === 'ready' && recentDocuments.length > 0 ? (
					<Card className='overflow-hidden rounded-lg'>
						<div className='divide-y'>
							{recentDocuments.slice(0, 4).map((document) => (
								<button
									key={document.id}
									type='button'
									onClick={() => {
										void handleOpenDocument(document.id)
									}}
									className='group flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-primary/4'>
									<div className='flex size-10 shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground transition-colors group-hover:border-primary/20 group-hover:bg-primary/8 group-hover:text-primary'>
										<File className='size-4' />
									</div>
									<div className='min-w-0 flex-1'>
										<p className='truncate text-sm font-medium text-foreground'>
											{document.title}
											{document.saveStatus === 'dirty' ? (
												<span className='ml-2 inline-block size-2 rounded-full bg-primary align-middle' />
											) : null}
										</p>
									</div>
									<div className='hidden shrink-0 items-center gap-1.5 text-xs text-muted-foreground md:flex'>
										<Clock className='size-3.5' />
										<span>{formatRelativeTime(document.lastOpenedAt ?? document.updatedAt)}</span>
									</div>
									<div className='w-12 shrink-0 text-right text-xs text-muted-foreground'>
										{resolveDocumentCategory(document.title)}
									</div>
								</button>
							))}
						</div>
					</Card>
				) : (
					<EmptyState
						title='近期活动为空'
						description='当前还没有最近打开记录，进入文档后这里会出现继续工作的入口。'
						icon={File}
					/>
				)}
			</div>
		</WorkspacePageShell>
	)
}

export default HomePage
