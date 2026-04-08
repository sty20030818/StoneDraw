import { ArrowLeftIcon, LoaderCircleIcon, SaveIcon } from 'lucide-react'
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
}

function WorkbenchTitleBar({
	documentTitle,
	isDocumentReady,
	saveStatus,
	isFlushing,
	onBack,
	onSave,
}: WorkbenchTitleBarProps) {
	const statusMeta = resolveSaveStatusMeta(saveStatus)
	const isSavePending = saveStatus === 'saving' || isFlushing

	return (
		<header className='flex shrink-0 items-center justify-between gap-4 border-b bg-background px-5 py-3'>
			<div className='flex min-w-0 items-center gap-4'>
				<Button
					type='button'
					variant='outline'
					size='lg'
					onClick={onBack}>
					<ArrowLeftIcon data-icon='inline-start' />
					工作区
				</Button>
				<div className='min-w-0'>
					<p className='text-xs font-medium uppercase text-muted-foreground'>Workbench</p>
					<div className='mt-1.5 flex min-w-0 items-center gap-3'>
						<h2 className='truncate text-lg leading-none font-semibold'>
							{isDocumentReady ? documentTitle : '工作台正在准备文档'}
						</h2>
						<span
							className={`inline-flex h-7 shrink-0 items-center justify-center rounded-full px-3 text-xs font-medium ${statusMeta.className}`}>
							{statusMeta.label}
						</span>
					</div>
				</div>
			</div>

			<div className='flex min-w-[16rem] flex-1 items-center justify-end gap-2.5'>
				<div className='inline-flex h-9 items-center rounded-full border bg-muted/40 px-4 text-sm text-muted-foreground'>
					本地版本工作台
				</div>
				<Button
					type='button'
					variant={saveStatus === 'error' ? 'destructive' : 'default'}
					size='lg'
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
