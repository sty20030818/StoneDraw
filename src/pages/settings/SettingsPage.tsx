import { useState } from 'react'
import { CheckCheckIcon, LoaderCircleIcon, Settings2Icon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import EmptyState from '@/components/states/EmptyState'
import LoadingState from '@/components/states/LoadingState'
import { settingsService } from '@/services'
import { useDialogHost } from '@/components/feedback/DialogHost'

function SettingsPage() {
	const { openDialog, openConfirmDialog } = useDialogHost()
	const [showLoadingPreview, setShowLoadingPreview] = useState(false)
	const defaultSettings = settingsService.getDefaults()

	async function handleReadSettings() {
		const result = await settingsService.read()

		if (result.ok) {
			toast.success('设置读取成功。')
		}
	}

	return (
		<div className='flex flex-col gap-5'>
			<section className='rounded-xl border border-border/70 bg-background/80 p-5 shadow-sm'>
				<div className='flex items-center gap-3'>
					<div className='flex size-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground'>
						<Settings2Icon />
					</div>
					<div className='flex flex-col gap-1'>
						<h2 className='text-xl font-semibold tracking-tight'>设置占位页</h2>
						<p className='text-sm text-muted-foreground'>
							这里用于验证设置路由、Dialog 容器、Confirm Dialog 和全局错误 Toast 链路。
						</p>
					</div>
				</div>

				<div className='mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.72fr)]'>
					<div className='rounded-[1.75rem] border border-border/70 bg-card p-4'>
						<h3 className='text-sm font-semibold'>默认设置骨架</h3>
						<div className='mt-4 grid gap-3 sm:grid-cols-2'>
							<div className='rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm'>
								<p className='text-xs text-muted-foreground'>语言</p>
								<p className='mt-1 font-medium'>{defaultSettings.language}</p>
							</div>
							<div className='rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm'>
								<p className='text-xs text-muted-foreground'>主题</p>
								<p className='mt-1 font-medium'>{defaultSettings.theme}</p>
							</div>
						</div>
					</div>

					<div className='flex flex-col gap-3 rounded-[1.75rem] border border-border/70 bg-card p-4'>
						<Button
							type='button'
							onClick={() => {
								openDialog({
									title: '全局 Dialog 已接通',
									description: '当前说明弹窗由统一容器承载。',
									content: '后面接设置表单、关于页、导入向导时，都可以复用这一个 Dialog 容器，而不是每页重复实现。',
								})
							}}>
							<CheckCheckIcon data-icon='inline-start' />
							打开说明弹窗
						</Button>
						<Button
							type='button'
							variant='outline'
							onClick={() => {
								openConfirmDialog({
									title: '确认弹窗占位',
									description: '这是后续危险操作的统一挂载位置，例如清空缓存、删除文档、重置配置。',
									confirmLabel: '确认占位',
								})
							}}>
							<Settings2Icon data-icon='inline-start' />
							打开确认弹窗
						</Button>
						<Button
							type='button'
							variant='secondary'
							onClick={() => {
								void handleReadSettings()
							}}>
							<Settings2Icon data-icon='inline-start' />
							触发设置读取
						</Button>
						<Button
							type='button'
							variant='ghost'
							onClick={() => {
								setShowLoadingPreview((current) => !current)
							}}>
							<LoaderCircleIcon
								className={showLoadingPreview ? 'animate-spin' : undefined}
								data-icon='inline-start'
							/>
							切换 Loading 占位
						</Button>
					</div>
				</div>
			</section>

			{showLoadingPreview ? (
				<LoadingState
					description='这里验证统一 Loading State 组件，后续会复用在文档读取、设置初始化和工作区加载链路。'
					title='正在准备设置数据'
				/>
			) : (
				<EmptyState
					description='当前还没有真实设置表单，先用统一空态组件承接占位说明和后续扩展入口。'
					icon={Settings2Icon}
					title='设置表单将在后续版本接入'
				/>
			)}
		</div>
	)
}

export default SettingsPage
