import { useCallback, useEffect, useState } from 'react'
import { Clock3Icon, HistoryIcon, LoaderCircleIcon, RefreshCcwIcon } from 'lucide-react'
import { toast } from 'sonner'
import { versionService } from '@/features/documents'
import type { DocumentVersionMeta, SaveStatus, TauriCommandResult } from '@/shared/types'

type HistoryPanelProps = {
	documentId: string | null
	documentTitle: string
	isDocumentReady: boolean
	saveStatus: SaveStatus
	onCreateVersion: () => Promise<TauriCommandResult<DocumentVersionMeta> | null>
}

type HistoryPanelState =
	| {
			status: 'loading'
	  }
	| {
			status: 'empty'
	  }
	| {
			status: 'ready'
			versions: DocumentVersionMeta[]
	  }
	| {
			status: 'error'
			message: string
	  }

const versionTimeFormatter = new Intl.DateTimeFormat('zh-CN', {
	month: '2-digit',
	day: '2-digit',
	hour: '2-digit',
	minute: '2-digit',
	hour12: false,
})

function formatVersionTime(timestamp: number) {
	return versionTimeFormatter.format(new Date(timestamp))
}

function HistoryPanel({ documentId, documentTitle, isDocumentReady, saveStatus, onCreateVersion }: HistoryPanelProps) {
	const [panelState, setPanelState] = useState<HistoryPanelState>({
		status: 'empty',
	})
	const [isCreatingVersion, setIsCreatingVersion] = useState(false)

	const loadVersions = useCallback(async () => {
		if (!documentId || !isDocumentReady) {
			setPanelState({
				status: 'empty',
			})
			return
		}

		setPanelState({
			status: 'loading',
		})

		const result = await versionService.listDocumentVersions(documentId)

		if (!result.ok) {
			setPanelState({
				status: 'error',
				message: result.error.details ?? result.error.message,
			})
			return
		}

		if (result.data.length === 0) {
			setPanelState({
				status: 'empty',
			})
			return
		}

		setPanelState({
			status: 'ready',
			versions: result.data,
		})
	}, [documentId, isDocumentReady])

	useEffect(() => {
		void loadVersions()
	}, [loadVersions])

	const handleCreateVersion = useCallback(async () => {
		if (!documentId || !isDocumentReady || isCreatingVersion) {
			return
		}

		setIsCreatingVersion(true)

		try {
			const createResult = await onCreateVersion()

			if (!createResult) {
				return
			}

			if (!createResult.ok) {
				toast('创建版本失败', {
					description: createResult.error.details ?? createResult.error.message,
				})
				return
			}

			toast('版本已创建', {
				description: `${createResult.data.label} 已冻结到本地历史。`,
			})
			await loadVersions()
		} finally {
			setIsCreatingVersion(false)
		}
	}, [documentId, isCreatingVersion, isDocumentReady, loadVersions, onCreateVersion])

	return (
		<div className='grid gap-3'>
			<section className='rounded-lg border bg-background p-4'>
				<div className='flex items-start justify-between gap-3'>
					<div className='min-w-0'>
						<p className='text-sm font-medium'>创建版本</p>
						<p className='mt-2 text-xs leading-5 text-muted-foreground'>聚焦正式主链已经交付的版本冻结能力。</p>
					</div>
					<button
						className='inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60'
						disabled={!documentId || !isDocumentReady || isCreatingVersion}
						onClick={() => {
							void handleCreateVersion()
						}}
						type='button'>
						{isCreatingVersion ? (
							<LoaderCircleIcon className='size-3.5 animate-spin' />
						) : (
							<HistoryIcon className='size-3.5' />
						)}
						创建版本
					</button>
				</div>
			</section>

			<section className='rounded-lg border bg-background p-4'>
				<p className='text-sm font-medium'>当前文档</p>
				<p className='mt-2 truncate text-sm text-foreground'>
					{isDocumentReady ? documentTitle : '当前还没有可追踪的文档版本上下文'}
				</p>
				<p className='mt-2 text-xs text-muted-foreground'>
					{documentId ? `ID: ${documentId}` : '等待 Workbench 注入 active document'}
				</p>
				<p className='mt-2 text-xs text-muted-foreground'>保存状态：{saveStatus}</p>
			</section>

			<section className='rounded-lg border bg-background p-4'>
				<div className='flex items-center justify-between gap-3'>
					<p className='text-sm font-medium'>版本列表</p>
					<button
						className='tauri-no-drag inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60'
						disabled={!documentId || !isDocumentReady || panelState.status === 'loading'}
						onClick={() => {
							void loadVersions()
						}}
						type='button'>
						<RefreshCcwIcon className={`size-3 ${panelState.status === 'loading' ? 'animate-spin' : ''}`} />
						刷新
					</button>
				</div>

				{panelState.status === 'loading' ? (
					<div className='mt-4 flex items-center gap-2 rounded-lg border border-dashed bg-muted/35 px-3 py-4 text-sm text-muted-foreground'>
						<LoaderCircleIcon className='size-4 animate-spin' />
						<span>正在读取本地版本历史…</span>
					</div>
				) : null}

				{panelState.status === 'empty' ? (
					<div className='mt-4 rounded-lg border border-dashed bg-muted/35 px-3 py-4 text-sm text-muted-foreground'>
						{documentId && isDocumentReady
							? '当前文档还没有冻结过手动版本。'
							: '请先打开一个文档，再查看它的历史版本。'}
					</div>
				) : null}

				{panelState.status === 'error' ? (
					<div className='mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-4 text-sm text-destructive'>
						读取版本列表失败：{panelState.message}
					</div>
				) : null}

				{panelState.status === 'ready' ? (
					<ul className='mt-4 grid gap-2'>
						{panelState.versions.map((version) => (
							<li
								className='rounded-lg border bg-card px-3 py-3'
								key={version.id}>
								<div className='flex items-start justify-between gap-3'>
									<div className='min-w-0'>
										<p className='truncate text-sm font-medium text-foreground'>{version.label}</p>
										<p className='mt-1 text-xs text-muted-foreground'>
											版本 #{version.versionNumber} · {version.versionKind}
										</p>
									</div>
									<div className='flex shrink-0 items-center gap-1 text-xs text-muted-foreground'>
										<Clock3Icon className='size-3' />
										<span>{formatVersionTime(version.createdAt)}</span>
									</div>
								</div>
								<p className='mt-2 truncate text-xs text-muted-foreground'>{version.snapshotPath}</p>
							</li>
						))}
					</ul>
				) : null}
			</section>
		</div>
	)
}

export default HistoryPanel
