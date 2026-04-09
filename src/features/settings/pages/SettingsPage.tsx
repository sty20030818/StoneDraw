import { DatabaseIcon, FolderTreeIcon, InfoIcon, KeyboardIcon, PaletteIcon, RouteIcon, Settings2Icon, UploadIcon } from 'lucide-react'
import { useAppStore } from '@/app/state'
import { PageSection, SectionHeader, WorkspacePageShell } from '@/shared/components'
import { Card, CardDescription, CardHeader, CardTitle } from '@/shared/ui'
import type { DatabaseHealthPayload, LocalDirectoriesPayload } from '@/shared/types'

type DiagnosticStatus = 'idle' | 'ready' | 'error'

function StatusBadge({ status, label }: { status: DiagnosticStatus; label?: string }) {
	const palette =
		status === 'ready'
			? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700'
			: status === 'error'
				? 'border-rose-500/20 bg-rose-500/10 text-rose-700'
				: 'border-border/70 bg-muted/60 text-muted-foreground'

	return (
		<span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${palette}`}>
			{label ?? status}
		</span>
	)
}

function formatTimestamp(value: string | null) {
	if (!value) {
		return '尚未记录'
	}

	return new Date(value).toLocaleString('zh-CN', {
		hour12: false,
	})
}

function formatSceneLabel(sceneKey: string) {
	switch (sceneKey) {
		case 'workspace':
			return '工作区'
		case 'workbench':
			return '工作台'
		default:
			return '未命中页面'
	}
}

function DirectoryGrid({ directories }: { directories: LocalDirectoriesPayload | null }) {
	if (!directories) {
		return (
			<div className='rounded-xl border border-dashed bg-background px-4 py-5 text-sm text-muted-foreground'>
				本次会话还没有拿到目录初始化结果。
			</div>
		)
	}

	return (
		<div className='grid gap-3 md:grid-cols-2 xl:grid-cols-3'>
			{Object.entries(directories).map(([key, directory]) => (
				<div
					key={key}
					className='rounded-xl border bg-background px-4 py-3'>
					<div className='flex items-center justify-between gap-3'>
						<p className='text-sm font-medium'>{key}</p>
						<StatusBadge
							status={directory.isReady ? 'ready' : 'error'}
							label={directory.isReady ? '正常' : '异常'}
						/>
					</div>
					<p className='mt-2 break-all text-xs leading-5 text-muted-foreground'>{directory.path}</p>
				</div>
			))}
		</div>
	)
}

function DatabasePanel({ databaseHealth }: { databaseHealth: DatabaseHealthPayload | null }) {
	if (!databaseHealth) {
		return (
			<div className='rounded-xl border border-dashed bg-background px-4 py-5 text-sm text-muted-foreground'>
				数据库还没有返回健康检查信息。
			</div>
		)
	}

	return (
		<div className='grid gap-3 md:grid-cols-2'>
			<div className='rounded-xl border bg-background px-4 py-3 text-sm'>
				<p className='text-xs text-muted-foreground'>数据库文件</p>
				<p className='mt-2 break-all font-medium'>{databaseHealth.databasePath}</p>
			</div>
			<div className='rounded-xl border bg-background px-4 py-3 text-sm'>
				<p className='text-xs text-muted-foreground'>数据库目录</p>
				<p className='mt-2 break-all font-medium'>{databaseHealth.databaseDir}</p>
			</div>
			<div className='rounded-xl border bg-background px-4 py-3 text-sm'>
				<p className='text-xs text-muted-foreground'>当前 schema</p>
				<p className='mt-2 font-medium'>{databaseHealth.schemaVersion}</p>
			</div>
			<div className='rounded-xl border bg-background px-4 py-3 text-sm'>
				<p className='text-xs text-muted-foreground'>目标 schema</p>
				<p className='mt-2 font-medium'>{databaseHealth.targetSchemaVersion}</p>
			</div>
		</div>
	)
}

function SettingsPage() {
	const localDirectoryStatus = useAppStore((state) => state.localDirectoryStatus)
	const localDirectories = useAppStore((state) => state.localDirectories)
	const localDirectoriesReadyAt = useAppStore((state) => state.localDirectoriesReadyAt)
	const databaseStatus = useAppStore((state) => state.databaseStatus)
	const databaseHealth = useAppStore((state) => state.databaseHealth)
	const databaseReadyAt = useAppStore((state) => state.databaseReadyAt)
	const activeSceneKey = useAppStore((state) => state.activeSceneKey)
	const activeRoutePath = useAppStore((state) => state.activeRoutePath)
	const settingGroups = [
		{
			title: '常规',
			description: '承接工作区偏好、默认行为和基础使用体验。',
			icon: Settings2Icon,
		},
		{
			title: '外观',
			description: '预留主题、密度与视觉偏好设置入口，保持浅色工作流体验。',
			icon: PaletteIcon,
		},
		{
			title: '存储与数据目录',
			description: '集中承接工作目录、数据库位置与本地数据结构相关配置。',
			icon: FolderTreeIcon,
		},
		{
			title: '导出偏好',
			description: '后续在这里整理导出格式、默认范围和交付习惯设置。',
			icon: UploadIcon,
		},
		{
			title: '快捷键',
			description: '预留轻量快捷键说明与后续键位定制入口。',
			icon: KeyboardIcon,
		},
		{
			title: '关于',
			description: '承接版本信息、环境信息和产品说明等静态信息。',
			icon: InfoIcon,
		},
	]

	return (
		<WorkspacePageShell>
			<PageSection
				header={
					<SectionHeader
						title='设置中心'
						description='设置页现在优先承接正式配置分组，诊断能力下沉到后半屏，保持 Workspace 一致的浅色 linear 管理态。'
					/>
				}>
				<section className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
					{settingGroups.map((group) => {
						const Icon = group.icon

						return (
							<Card
								key={group.title}
								className='rounded-2xl border-border/80 shadow-sm'>
								<CardHeader className='gap-3'>
									<div className='flex size-11 items-center justify-center rounded-2xl border bg-card shadow-sm'>
										<Icon className='size-5 text-muted-foreground' />
									</div>
									<CardTitle className='text-base font-semibold tracking-tight'>{group.title}</CardTitle>
									<CardDescription className='text-sm leading-6'>{group.description}</CardDescription>
								</CardHeader>
							</Card>
						)
					})}
				</section>
			</PageSection>

			<PageSection
				header={
					<SectionHeader
						title='诊断与环境'
						description='保留当前场景、目录初始化和数据库状态摘要，用于确认本地运行环境是否稳定。'
					/>
				}>
				<section className='grid gap-4 lg:grid-cols-3'>
					<div className='rounded-xl border bg-background p-5'>
						<div className='flex items-center gap-3'>
							<RouteIcon className='size-4 text-muted-foreground' />
							<h3 className='text-sm font-semibold'>当前场景</h3>
						</div>
						<p className='mt-4 text-2xl font-semibold tracking-tight'>{formatSceneLabel(activeSceneKey)}</p>
						<p className='mt-2 break-all text-sm text-muted-foreground'>{activeRoutePath ?? '当前路由尚未同步'}</p>
					</div>

					<div className='rounded-xl border bg-background p-5'>
						<div className='flex items-center gap-3'>
							<FolderTreeIcon className='size-4 text-muted-foreground' />
							<h3 className='text-sm font-semibold'>目录初始化</h3>
						</div>
						<div className='mt-4 flex items-center gap-3'>
							<StatusBadge status={localDirectoryStatus} />
							<span className='text-sm text-muted-foreground'>{formatTimestamp(localDirectoriesReadyAt)}</span>
						</div>
					</div>

					<div className='rounded-xl border bg-background p-5'>
						<div className='flex items-center gap-3'>
							<DatabaseIcon className='size-4 text-muted-foreground' />
							<h3 className='text-sm font-semibold'>数据库状态</h3>
						</div>
						<div className='mt-4 flex items-center gap-3'>
							<StatusBadge status={databaseStatus} />
							<span className='text-sm text-muted-foreground'>{formatTimestamp(databaseReadyAt)}</span>
						</div>
					</div>
				</section>
			</PageSection>

			<PageSection
				header={
					<SectionHeader
						title='目录健康检查'
						description='用于确认本地工作目录是否完整建立，并为后续存储配置提供事实依据。'
						actions={<StatusBadge status={localDirectoryStatus} />}
					/>
				}>
				{localDirectoryStatus === 'error' ? (
					<div className='mb-4 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive'>
						目录健康检查异常。请检查本地工作目录初始化结果和启动日志。
					</div>
				) : null}
				<DirectoryGrid directories={localDirectories} />
			</PageSection>

			<PageSection
				header={
					<SectionHeader
						title='数据库健康检查'
						description='保留 migration 与本地数据库可用性的诊断窗口，避免设置页丢失环境可观察性。'
						actions={<StatusBadge status={databaseStatus} />}
					/>
				}>
				{databaseStatus === 'error' ? (
					<div className='mb-4 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive'>
						数据库健康检查异常。请检查数据库文件、迁移状态和错误日志。
					</div>
				) : null}
				<DatabasePanel databaseHealth={databaseHealth} />
			</PageSection>
		</WorkspacePageShell>
	)
}

export default SettingsPage
