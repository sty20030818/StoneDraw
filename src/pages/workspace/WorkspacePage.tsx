import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRightIcon, FileStackIcon, LayoutGridIcon, PanelTopOpenIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import EmptyState from '@/components/states/EmptyState'
import { APP_FEATURE_SCOPE, APP_STATUS_BADGE } from '@/constants'
import { APP_ROUTES } from '@/constants/routes'
import { documentService } from '@/services'
import { useDialogHost } from '@/components/feedback/DialogHost'

function WorkspacePage() {
	const navigate = useNavigate()
	const { openConfirmDialog } = useDialogHost()
	const draftDocument = useMemo(() => documentService.createDraft('欢迎画板'), [])

	return (
		<div className='flex flex-col gap-5'>
			<section className='grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(20rem,0.8fr)]'>
				<div className='rounded-xl border border-border/70 bg-background/80 p-5 shadow-sm'>
					<div className='flex flex-col gap-3'>
						<span className='w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold tracking-[0.16em] text-primary uppercase'>
							{APP_STATUS_BADGE}
						</span>
						<div className='flex flex-col gap-2'>
							<h2 className='text-2xl font-semibold tracking-tight'>工作区已经成为默认入口</h2>
							<p className='max-w-2xl text-sm leading-6 text-muted-foreground'>
								`0.1.5` 把应用从单页演示推进到了真正的桌面外壳。现在默认进入工作区，再从这里跳转到编辑器和设置页。
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
							<FileStackIcon />
						</div>
						<div className='flex flex-col gap-1'>
							<h3 className='font-semibold'>最近草稿占位</h3>
							<p className='text-sm text-muted-foreground'>这里先用 service 骨架生成一份欢迎草稿。</p>
						</div>
					</div>

					{draftDocument.ok ? (
						<div className='mt-4 flex flex-col gap-3 rounded-lg border border-border/70 bg-card p-4'>
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
							<div className='grid gap-2 text-xs text-muted-foreground sm:grid-cols-2'>
								<span>文档 ID：{draftDocument.data.id}</span>
								<span>更新时间：{draftDocument.data.updatedAt}</span>
							</div>
						</div>
					) : null}
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
								这些能力已经纳入应用壳，可继续承接后面的 Excalidraw 与文档能力。
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

				<EmptyState
					actionLabel='去设置页'
					description='真实文档列表和最近打开记录会在后续版本挂到这里；现在先验证统一空态组件和路由结构。'
					icon={FileStackIcon}
					onAction={() => {
						navigate(APP_ROUTES.SETTINGS)
					}}
					title='文档列表占位'
				/>
			</section>
		</div>
	)
}

export default WorkspacePage
