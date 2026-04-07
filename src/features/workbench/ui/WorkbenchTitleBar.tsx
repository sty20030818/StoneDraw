import { ArrowLeftIcon, DownloadIcon, LoaderCircleIcon, MoreHorizontalIcon, SaveIcon, SearchIcon } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import type { SaveStatus } from '@/shared/types'
import { resolveSaveStatusMeta } from './save-status'

type WorkbenchTitleBarProps = {
	documentTitle: string
	searchDraft: string
	isDocumentReady: boolean
	saveStatus: SaveStatus
	isFlushing: boolean
	onBack: () => void
	onSave: () => void
	onExport: () => void
	onMore: () => void
	onSearchChange: (value: string) => void
}

function WorkbenchTitleBar({
	documentTitle,
	searchDraft,
	isDocumentReady,
	saveStatus,
	isFlushing,
	onBack,
	onSave,
	onExport,
	onMore,
	onSearchChange,
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
				<div className='relative w-full max-w-[28rem]'>
					<SearchIcon className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
					<Input
						type='search'
						className='h-9 rounded-full border-border/70 bg-[#f6f8fc] pl-9 shadow-[inset_0_1px_0_rgba(255,255,255,0.86)]'
						value={searchDraft}
						disabled={!isDocumentReady}
						onChange={(event) => {
							onSearchChange(event.target.value)
						}}
						placeholder='搜索画布内容（本阶段仅保留输入骨架）'
					/>
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
