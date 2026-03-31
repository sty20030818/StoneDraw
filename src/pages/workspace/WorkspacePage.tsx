import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
	ArrowRightIcon,
	DatabaseZapIcon,
	FileStackIcon,
	FolderOpenIcon,
	LayoutGridIcon,
	PanelTopOpenIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import EmptyState from '@/components/states/EmptyState'
import { APP_FEATURE_SCOPE, APP_STATUS_BADGE } from '@/constants'
import { APP_ROUTES } from '@/constants/routes'
import { documentService } from '@/services'
import { useDialogHost } from '@/components/feedback/DialogHost'
import { useAppStore } from '@/stores'

function WorkspacePage() {
	const navigate = useNavigate()
	const { openConfirmDialog } = useDialogHost()
	const draftDocument = useMemo(() => documentService.createDraft('欢迎画板'), [])
	const localDirectoryStatus = useAppStore((state) => state.localDirectoryStatus)
	const localDirectories = useAppStore((state) => state.localDirectories)
	const localDirectoriesReadyAt = useAppStore((state) => state.localDirectoriesReadyAt)
	const databaseStatus = useAppStore((state) => state.databaseStatus)
	const databaseHealth = useAppStore((state) => state.databaseHealth)
	const databaseReadyAt = useAppStore((state) => state.databaseReadyAt)

	return (
		<div className='flex flex-col gap-5'>
			<section className='grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(20rem,0.8fr)]'>
				<div className='rounded-xl border border-border/70 bg-background/80 p-5 shadow-sm'>
					<div className='flex flex-col gap-3'>
						<span className='w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold tracking-[0.16em] text-primary uppercase'>
							{APP_STATUS_BADGE}
						</span>
						<div className='flex flex-col gap-2'>
							<h2 className='text-2xl font-semibold tracking-tight'>SQLite 与 migration 已接入启动默认链路</h2>
							<p className='max-w-2xl text-sm leading-6 text-muted-foreground'>
								当前版本会在 `~/.stonedraw/data/db/stonedraw.sqlite` 下初始化本地元数据数据库，
								并在启动时顺序执行未应用的 migration。
							</p>
						</div>
					</div>

					<Separator className='my-5' />

					<div className='flex flex-wrap gap-3'>
						<Button
							type='button'
							onClick={() => {
								navigate(APP_ROUTES.EDITOR)
							}}>
							<PanelTopOpenIcon data-icon='inline-start' />
							进入编辑器
						</Button>
						<Button
							type='button'
							variant='outline'
							onClick={() => {
								openConfirmDialog({
									title: '确认新建文档占位',
									description: '当前版本只验证统一 Confirm Dialog 容器，不会真正创建或覆盖文件。',
									confirmLabel: '继续占位流程',
								})
							}}>
							<ArrowRightIcon data-icon='inline-start' />
							打开确认弹窗
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
								工作区页面通过 app store 展示目录与 SQLite bridge 结果，不直接调用底层 command。
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
								<p className='text-xs text-muted-foreground'>最近就绪时间</p>
								<p className='mt-1 text-sm font-medium'>{localDirectoriesReadyAt ?? '尚未完成目录初始化'}</p>
							</div>
						</div>
						<div className='grid gap-3'>
							<div className='rounded-lg border border-border/70 bg-background px-4 py-3'>
								<p className='text-xs text-muted-foreground'>StoneDraw 根目录</p>
								<p className='mt-1 break-all text-sm font-medium'>
									{localDirectories?.rootDir.path ?? '等待目录初始化'}
								</p>
							</div>
							<div className='rounded-lg border border-border/70 bg-background px-4 py-3'>
								<p className='text-xs text-muted-foreground'>本地数据目录</p>
								<p className='mt-1 break-all text-sm font-medium'>
									{localDirectories?.dataDir.path ?? '等待目录初始化'}
								</p>
							</div>
							<div className='rounded-lg border border-border/70 bg-background px-4 py-3'>
								<p className='text-xs text-muted-foreground'>本地配置目录</p>
								<p className='mt-1 break-all text-sm font-medium'>
									{localDirectories?.configDir.path ?? '等待目录初始化'}
								</p>
							</div>
						</div>
						<Separator />
						<div className='flex items-center gap-3'>
							<div className='flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
								<DatabaseZapIcon />
							</div>
							<div className='flex flex-col gap-1'>
								<h4 className='font-semibold'>SQLite 元数据状态</h4>
								<p className='text-sm text-muted-foreground'>当前阶段只负责元数据和 migration，不承载 scene 大对象。</p>
							</div>
						</div>
						<div className='grid gap-3 sm:grid-cols-2'>
							<div className='rounded-lg border border-border/70 bg-background px-4 py-3'>
								<p className='text-xs text-muted-foreground'>数据库状态</p>
								<p className='mt-1 text-sm font-medium'>{databaseStatus}</p>
							</div>
							<div className='rounded-lg border border-border/70 bg-background px-4 py-3'>
								<p className='text-xs text-muted-foreground'>最近就绪时间</p>
								<p className='mt-1 text-sm font-medium'>{databaseReadyAt ?? '尚未完成数据库初始化'}</p>
							</div>
						</div>
						<div className='grid gap-3'>
							<div className='rounded-lg border border-border/70 bg-background px-4 py-3'>
								<p className='text-xs text-muted-foreground'>数据库文件</p>
								<p className='mt-1 break-all text-sm font-medium'>
									{databaseHealth?.databasePath ?? '等待数据库初始化'}
								</p>
							</div>
							<div className='grid gap-3 sm:grid-cols-2'>
								<div className='rounded-lg border border-border/70 bg-background px-4 py-3'>
									<p className='text-xs text-muted-foreground'>当前 schema 版本</p>
									<p className='mt-1 text-sm font-medium'>{databaseHealth?.schemaVersion ?? '未初始化'}</p>
								</div>
								<div className='rounded-lg border border-border/70 bg-background px-4 py-3'>
									<p className='text-xs text-muted-foreground'>目标 schema 版本</p>
									<p className='mt-1 text-sm font-medium'>{databaseHealth?.targetSchemaVersion ?? '未初始化'}</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section className='grid gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]'>
				<div className='rounded-xl border border-border/70 bg-background/80 p-5 shadow-sm'>
					<div className='flex items-center gap-3'>
						<div className='flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
							<LayoutGridIcon />
						</div>
						<div className='flex flex-col gap-1'>
							<h3 className='font-semibold'>当前版本覆盖范围</h3>
							<p className='text-sm text-muted-foreground'>
								这些能力已经纳入启动链路，可继续承接后面的文档元数据、设置持久化和索引表设计。
							</p>
						</div>
					</div>
					<div className='mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
						{APP_FEATURE_SCOPE.map((item) => (
							<div
								key={item}
								className='rounded-lg border border-border/70 bg-card px-4 py-3 text-sm font-medium shadow-xs'>
								{item}
							</div>
						))}
					</div>
				</div>

				<div className='flex flex-col gap-4'>
					{draftDocument.ok ? (
						<div className='rounded-xl border border-border/70 bg-background/80 p-5 shadow-sm'>
							<div className='flex items-center justify-between gap-3'>
								<div>
									<p className='text-sm font-medium'>{draftDocument.data.title}</p>
									<p className='text-xs text-muted-foreground'>{draftDocument.data.fileName}</p>
								</div>
								<Button
									size='sm'
									variant='secondary'
									type='button'
									onClick={() => {
										navigate(APP_ROUTES.EDITOR)
									}}>
									<ArrowRightIcon data-icon='inline-start' />
									继续
								</Button>
							</div>
							<div className='mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2'>
								<span>文档 ID：{draftDocument.data.id}</span>
								<span>更新时间：{draftDocument.data.updatedAt}</span>
							</div>
						</div>
					) : null}

					<EmptyState
						actionLabel='去设置页'
						description='真实文档列表和最近打开记录会在后续版本挂到这里；现在先让工作区承接目录、数据库状态和路由跳转。'
						icon={FileStackIcon}
						onAction={() => {
							navigate(APP_ROUTES.SETTINGS)
						}}
						title='文档列表占位'
					/>
				</div>
			</section>
		</div>
	)
}

export default WorkspacePage
