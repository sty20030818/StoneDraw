import { BugIcon, DatabaseIcon, FolderTreeIcon, RouteIcon } from 'lucide-react'
import { useAppStore } from '@/app/state'
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
			<div className='rounded-2xl border border-dashed border-border/70 bg-background/70 px-4 py-5 text-sm text-muted-foreground'>
				本次会话还没有拿到目录初始化结果。
			</div>
		)
	}

	return (
		<div className='grid gap-3 md:grid-cols-2 xl:grid-cols-3'>
			{Object.entries(directories).map(([key, directory]) => (
				<div
					key={key}
					className='rounded-2xl border border-border/70 bg-background/80 px-4 py-3'>
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
			<div className='rounded-2xl border border-dashed border-border/70 bg-background/70 px-4 py-5 text-sm text-muted-foreground'>
				数据库还没有返回健康检查信息。
			</div>
		)
	}

	return (
		<div className='grid gap-3 md:grid-cols-2'>
			<div className='rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm'>
				<p className='text-xs text-muted-foreground'>数据库文件</p>
				<p className='mt-2 break-all font-medium'>{databaseHealth.databasePath}</p>
			</div>
			<div className='rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm'>
				<p className='text-xs text-muted-foreground'>数据库目录</p>
				<p className='mt-2 break-all font-medium'>{databaseHealth.databaseDir}</p>
			</div>
			<div className='rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm'>
				<p className='text-xs text-muted-foreground'>当前 schema</p>
				<p className='mt-2 font-medium'>{databaseHealth.schemaVersion}</p>
			</div>
			<div className='rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm'>
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

	return (
		<div className='flex flex-col gap-5'>
			<section className='rounded-[1.75rem] border border-border/70 bg-card/78 p-6'>
				<div className='flex items-start gap-4'>
					<div className='flex size-12 items-center justify-center rounded-2xl bg-accent/70 text-accent-foreground'>
						<BugIcon />
					</div>
					<div className='space-y-2'>
						<h2 className='text-xl font-semibold tracking-tight'>设置与开发诊断</h2>
						<p className='max-w-3xl text-sm leading-6 text-muted-foreground'>
							旧工作区首页里的系统状态和数据库健康检查已经收口到这里，避免主产品页面继续混入开发辅助信息。
						</p>
					</div>
				</div>
			</section>

			<section className='grid gap-4 lg:grid-cols-3'>
				<div className='rounded-[1.5rem] border border-border/70 bg-card p-5'>
					<div className='flex items-center gap-3'>
						<RouteIcon className='size-4 text-muted-foreground' />
						<h3 className='text-sm font-semibold'>当前场景</h3>
					</div>
					<p className='mt-4 text-2xl font-semibold tracking-tight'>{formatSceneLabel(activeSceneKey)}</p>
					<p className='mt-2 break-all text-sm text-muted-foreground'>{activeRoutePath ?? '当前路由尚未同步'}</p>
				</div>

				<div className='rounded-[1.5rem] border border-border/70 bg-card p-5'>
					<div className='flex items-center gap-3'>
						<FolderTreeIcon className='size-4 text-muted-foreground' />
						<h3 className='text-sm font-semibold'>目录初始化</h3>
					</div>
					<div className='mt-4 flex items-center gap-3'>
						<StatusBadge status={localDirectoryStatus} />
						<span className='text-sm text-muted-foreground'>{formatTimestamp(localDirectoriesReadyAt)}</span>
					</div>
				</div>

				<div className='rounded-[1.5rem] border border-border/70 bg-card p-5'>
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

			<section className='rounded-[1.75rem] border border-border/70 bg-card p-5'>
				<div className='flex items-center justify-between gap-3'>
					<div>
						<h3 className='text-base font-semibold tracking-tight'>目录健康检查</h3>
						<p className='mt-1 text-sm text-muted-foreground'>用于确认本地工作目录是否完整建立。</p>
					</div>
					<StatusBadge status={localDirectoryStatus} />
				</div>
				<div className='mt-4'>
					<DirectoryGrid directories={localDirectories} />
				</div>
			</section>

			<section className='rounded-[1.75rem] border border-border/70 bg-card p-5'>
				<div className='flex items-center justify-between gap-3'>
					<div>
						<h3 className='text-base font-semibold tracking-tight'>数据库健康检查</h3>
						<p className='mt-1 text-sm text-muted-foreground'>保留 migration 与本地数据库可用性的调试窗口。</p>
					</div>
					<StatusBadge status={databaseStatus} />
				</div>
				<div className='mt-4'>
					<DatabasePanel databaseHealth={databaseHealth} />
				</div>
			</section>
		</div>
	)
}

export default SettingsPage
