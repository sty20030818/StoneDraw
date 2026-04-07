import { ArrowLeftIcon, DownloadIcon, LoaderCircleIcon, MoreHorizontalIcon, SaveIcon } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import type { SaveStatus } from '@/shared/types'
import { resolveSaveStatusMeta } from './save-status'

type WorkbenchTitleBarProps = {
	documentTitle: string
	isDocumentReady: boolean
	saveStatus: SaveStatus
	isFlushing: boolean
	onBack: () => void
	onSave: () => void
	onExport: () => void
	onMore: () => void
}

function WorkbenchTitleBar({
	documentTitle,
	isDocumentReady,
	saveStatus,
	isFlushing,
	onBack,
	onSave,
	onExport,
	onMore,
}: WorkbenchTitleBarProps) {
	const statusMeta = resolveSaveStatusMeta(saveStatus)
	const isSavePending = saveStatus === 'saving' || isFlushing

	return (
		<header className='flex shrink-0 items-center justify-between gap-4 border-b border-border/60 bg-white/92 px-5 py-3'>
			<div className='flex min-w-0 items-center gap-4'>
				<Button
					type='button'
					variant='outline'
					className='h-9 rounded-xl bg-white px-3 shadow-sm'
					onClick={onBack}>
					<ArrowLeftIcon data-icon='inline-start' />
					工作区
				</Button>
				<div className='min-w-0'>
					<p className='text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground'>Workbench</p>
					<div className='mt-1.5 flex min-w-0 items-center gap-3'>
						<h2 className='truncate font-[Bahnschrift,"Microsoft_YaHei_UI",sans-serif] text-[1.1rem] leading-none font-bold tracking-[0.02em]'>
							{isDocumentReady ? documentTitle : '工作台正在准备文档'}
						</h2>
						<span
							className={`inline-flex h-7 shrink-0 items-center justify-center rounded-full px-3 text-[11px] font-medium ${statusMeta.className}`}>
							{statusMeta.label}
						</span>
					</div>
				</div>
			</div>

			<div className='flex min-w-[20rem] flex-1 items-center justify-end gap-2.5'>
				<div className='inline-flex h-9 items-center rounded-full border border-border/70 bg-[#f6f8fc] px-4 text-sm text-muted-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.86)]'>
					本地版本工作台
				</div>
				<Button
					type='button'
					variant='outline'
					className='size-9 rounded-xl bg-white shadow-sm'
					title='导出'
					onClick={onExport}>
					<DownloadIcon />
				</Button>
				<Button
					type='button'
					variant='outline'
					className='size-9 rounded-xl bg-white shadow-sm'
					title='更多'
					onClick={onMore}>
					<MoreHorizontalIcon />
				</Button>
				<Button
					type='button'
					variant={saveStatus === 'error' ? 'default' : 'outline'}
					className={[
						'h-9 rounded-xl px-4 shadow-sm',
						saveStatus === 'error'
							? 'bg-[linear-gradient(135deg,#8f1d1d,#d92d20)] text-white'
							: 'bg-[linear-gradient(135deg,#1234a8,#1b4dff)] text-white hover:brightness-105',
					].join(' ')}
					title='保存'
					disabled={!isDocumentReady || isSavePending}
					onClick={onSave}>
					{isSavePending ? (
						<LoaderCircleIcon
							data-icon='inline-start'
							className='animate-spin'
						/>
					) : (
						<SaveIcon data-icon='inline-start' />
					)}
					{saveStatus === 'error' ? '重试保存' : '保存'}
				</Button>
			</div>
		</header>
	)
}

export default WorkbenchTitleBar
