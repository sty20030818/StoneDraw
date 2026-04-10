import { useCallback, useEffect, useState } from 'react'
import { LoaderCircleIcon } from 'lucide-react'
import { formatRelativeTime } from '@/features/documents/ui/document-ui'
import { toast } from 'sonner'
import { versionService } from '@/features/documents'
import type { DocumentVersionMeta, TauriCommandResult } from '@/shared/types'

type HistoryPanelProps = {
	documentId: string | null
	isDocumentReady: boolean
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

function resolveVersionKindLabel() {
	return '版本'
}

function HistoryPanel({ documentId, isDocumentReady, onCreateVersion }: HistoryPanelProps) {
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
		<div className='flex w-full min-w-0 flex-col gap-3 overflow-x-hidden'>
			<button
				className='inline-flex w-full items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60'
				disabled={!documentId || !isDocumentReady || isCreatingVersion}
				onClick={() => {
					void handleCreateVersion()
				}}
				type='button'>
				{isCreatingVersion ? <LoaderCircleIcon className='size-4 animate-spin' /> : null}
				{isCreatingVersion ? '创建中…' : '创建版本'}
			</button>

			{panelState.status === 'loading' ? (
				<div className='flex w-full items-center gap-2 px-3 py-4 text-sm text-muted-foreground'>
					<LoaderCircleIcon className='size-4 animate-spin' />
					<span>正在读取本地版本历史…</span>
				</div>
			) : null}

			{panelState.status === 'empty' ? (
				<div className='w-full px-3 py-4 text-sm text-muted-foreground'>
					{documentId && isDocumentReady ? '当前文档还没有冻结过手动版本。' : '请先打开一个文档，再查看它的历史版本。'}
				</div>
			) : null}

			{panelState.status === 'error' ? (
				<div className='w-full px-3 py-4 text-sm text-destructive'>读取版本列表失败：{panelState.message}</div>
			) : null}

			{panelState.status === 'ready' ? (
				<ul className='m-0 flex w-full min-w-0 list-none flex-col gap-1 overflow-x-hidden p-0'>
					{panelState.versions.map((version) => (
						<li
							key={version.id}
							className='w-full min-w-0'>
							<div className='flex min-w-0 w-full flex-col gap-1 overflow-hidden rounded-md px-3 py-2 text-left text-foreground transition-colors hover:bg-muted/60'>
								<p className='w-full truncate text-sm font-medium'>{version.label}</p>
								<div className='flex min-w-0 items-center justify-between gap-3 text-xs text-muted-foreground'>
									<span className='min-w-0 truncate'>{formatRelativeTime(version.createdAt)}</span>
									<span className='shrink-0'>{resolveVersionKindLabel()}</span>
								</div>
							</div>
						</li>
					))}
				</ul>
			) : null}
		</div>
	)
}

export default HistoryPanel
