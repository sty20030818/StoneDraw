import { BugIcon, DatabaseIcon, FolderTreeIcon, RouteIcon } from 'lucide-react'
import { useAppStore } from '@/app/state'
import { PageSection, SectionHeader, WorkspacePageShell } from '@/shared/components'
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

	return (
		<WorkspacePageShell
			title='设置与诊断'
			description='统一设置页壳层，保留当前目录健康、数据库状态和调试信息。'
			actions={
				<div className='flex items-center gap-2 text-xs text-muted-foreground'>
					<BugIcon className='size-3.5' />
					<span>正式设置页骨架</span>
				</div>
			}>
			<PageSection
				header={
					<SectionHeader
						title='当前会话概览'
						description='保留当前场景、目录初始化和数据库状态摘要。'
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
						description='用于确认本地工作目录是否完整建立。'
						actions={<StatusBadge status={localDirectoryStatus} />}
					/>
				}>
				<DirectoryGrid directories={localDirectories} />
			</PageSection>

			<PageSection
				header={
					<SectionHeader
						title='数据库健康检查'
						description='保留 migration 与本地数据库可用性的调试窗口。'
						actions={<StatusBadge status={databaseStatus} />}
					/>
				}>
				<DatabasePanel databaseHealth={databaseHealth} />
			</PageSection>
		</WorkspacePageShell>
	)
}

export default SettingsPage
