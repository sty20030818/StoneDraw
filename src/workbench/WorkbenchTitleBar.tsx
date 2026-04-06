import {
	ArrowLeftIcon,
	DownloadIcon,
	LoaderCircleIcon,
	MoreHorizontalIcon,
	SaveIcon,
	SearchIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { SaveStatus } from '@/types'
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
		<header className='flex shrink-0 flex-wrap items-center justify-between gap-4 bg-background/86 px-5 py-4'>
			<div className='flex min-w-0 items-center gap-4'>
				<Button
					type='button'
					size='lg'
					variant='outline'
					className='rounded-2xl bg-white/80 px-4'
					onClick={onBack}>
					<ArrowLeftIcon data-icon='inline-start' />
					返回工作区
				</Button>
				<div className='min-w-0'>
					<p className='text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground'>Workbench</p>
					<div className='mt-2 flex min-w-0 items-center gap-3'>
						<h2 className='truncate text-lg font-semibold tracking-tight'>
							{isDocumentReady ? documentTitle : '工作台正在准备文档'}
						</h2>
						<span
							className={`inline-flex h-8 shrink-0 items-center justify-center rounded-full px-4 text-xs font-medium ${statusMeta.className}`}>
							{statusMeta.label}
						</span>
					</div>
				</div>
			</div>

			<div className='flex min-w-[20rem] flex-1 items-center justify-end gap-3'>
				<div className='relative w-full max-w-xl'>
					<SearchIcon className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
					<Input
						type='search'
						className='pl-9'
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
					size='icon-lg'
					variant='outline'
					className='rounded-2xl bg-white/80'
					title='导出'
					onClick={onExport}>
					<DownloadIcon />
				</Button>
				<Button
					type='button'
					size='icon-lg'
					variant='outline'
					className='rounded-2xl bg-white/80'
					title='更多'
					onClick={onMore}>
					<MoreHorizontalIcon />
				</Button>
				<Button
					type='button'
					size='lg'
					variant={saveStatus === 'error' ? 'default' : 'outline'}
					className='rounded-2xl px-4'
					title='保存'
					disabled={!isDocumentReady || isSavePending}
					onClick={onSave}>
					{isSavePending ? (
						<LoaderCircleIcon data-icon='inline-start' className='animate-spin' />
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
