import { ArrowLeftIcon, LoaderCircleIcon, SaveIcon, SlidersHorizontalIcon } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import type { SaveStatus } from '@/shared/types'
import { resolveSaveStatusMeta } from './save-status'

type WorkbenchTitleBarProps = {
	documentTitle: string
	isDocumentReady: boolean
	saveStatus: SaveStatus
	isFlushing: boolean
	isRightPanelOpen: boolean
	onBack: () => void
	onSave: () => void
	onToggleRightPanel: () => void
}

function WorkbenchTitleBar({
	documentTitle,
	isDocumentReady,
	saveStatus,
	isFlushing,
	isRightPanelOpen,
	onBack,
	onSave,
	onToggleRightPanel,
}: WorkbenchTitleBarProps) {
	const statusMeta = resolveSaveStatusMeta(saveStatus)
	const isSavePending = saveStatus === 'saving' || isFlushing

	return (
		<header className='flex shrink-0 items-center justify-between gap-4 border-b bg-background px-4 py-3'>
			<div className='flex min-w-0 items-center gap-4'>
				<Button
					type='button'
					variant='outline'
					size='default'
					onClick={onBack}>
					<ArrowLeftIcon data-icon='inline-start' />
					工作区
				</Button>
				<div className='min-w-0'>
					<p className='text-xs font-medium uppercase text-muted-foreground'>Workbench</p>
					<div className='mt-1.5 flex min-w-0 items-center gap-2.5'>
						<h2 className='truncate text-base leading-none font-semibold'>
							{isDocumentReady ? documentTitle : '工作台正在准备文档'}
						</h2>
						<span
							className={`inline-flex h-6 shrink-0 items-center justify-center rounded-full px-2.5 text-xs font-medium ${statusMeta.className}`}>
							{statusMeta.label}
						</span>
					</div>
				</div>
			</div>

			<div className='flex min-w-[16rem] flex-1 items-center justify-end gap-2'>
				<Button
					type='button'
					variant='ghost'
					size='default'
					aria-pressed={isRightPanelOpen}
					title={isRightPanelOpen ? '收起右侧栏' : '展开右侧栏'}
					onClick={onToggleRightPanel}>
					<SlidersHorizontalIcon data-icon='inline-start' />
					{isRightPanelOpen ? '收起侧栏' : '显示侧栏'}
				</Button>
				<Button
					type='button'
					variant={saveStatus === 'error' ? 'destructive' : 'default'}
					size='default'
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
