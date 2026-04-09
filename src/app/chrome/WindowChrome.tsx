import { useEffect, useRef, useState } from 'react'
import { DownloadIcon, MinusIcon, PlusIcon, SearchIcon, SquareIcon, XIcon } from 'lucide-react'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { toast } from 'sonner'
import { useOverlayStore } from '@/features/overlays'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { Separator } from '@/shared/ui/separator'
import { APP_ROUTES } from '@/shared/constants/routes'
import { useAppStore } from '@/app/state'
import { cn } from '@/shared/lib/utils'
import { detectDesktopShellPlatform } from './platform-shell'

async function runWindowAction(action: 'minimize' | 'toggleMaximize' | 'close') {
	try {
		const appWindow = getCurrentWindow()

		if (action === 'minimize') {
			await appWindow.minimize()
			return
		}

		if (action === 'toggleMaximize') {
			await appWindow.toggleMaximize()
			return
		}

		await appWindow.close()
	} catch {
		// 浏览器预览或缺少窗口权限时静默降级，不阻断普通页面开发。
	}
}

function readWorkspaceSearchQuery() {
	if (typeof window === 'undefined') {
		return ''
	}

	const hash = window.location.hash
	const queryIndex = hash.indexOf('?')

	if (queryIndex < 0) {
		return ''
	}

	const searchParams = new URLSearchParams(hash.slice(queryIndex + 1))
	return searchParams.get('q') ?? ''
}

type WindowChromeProps = {
	scene: 'workspace' | 'workbench'
	className?: string
}

function WindowChrome({ scene, className }: WindowChromeProps) {
	const shellPlatform = detectDesktopShellPlatform()
	const isMacShell = shellPlatform === 'mac'
	const activeRoutePath = useAppStore((state) => state.activeRoutePath)
	const openNewDocumentDialog = useOverlayStore((state) => state.openNewDocumentDialog)
	const [chromeSearchDraft, setChromeSearchDraft] = useState('')
	const chromeSearchInputRef = useRef<HTMLInputElement | null>(null)
	const windowsWindowControlButtonBaseClass = 'grid h-full place-items-center text-muted-foreground transition-colors'
	const windowsWindowControlButtonClass = `${windowsWindowControlButtonBaseClass} hover:bg-foreground/8 hover:text-foreground`
	const windowsWindowCloseButtonClass = `${windowsWindowControlButtonBaseClass} hover:bg-destructive hover:text-primary-foreground`
	const searchFlexClass = 'min-w-[24rem] max-w-[40rem] basis-[32rem] flex-[1_1_auto]'
	const topbarPaddingClass =
		scene === 'workspace' ? (isMacShell ? 'pl-8 pr-3' : 'pl-8 pr-0') : isMacShell ? 'pl-5 pr-3' : 'pl-4 pr-0'

	useEffect(() => {
		setChromeSearchDraft(readWorkspaceSearchQuery())
	}, [activeRoutePath])

	function submitChromeSearch() {
		const trimmedDraft = chromeSearchDraft.trim()

		if (!trimmedDraft) {
			window.location.hash = APP_ROUTES.WORKSPACE_DOCUMENTS
			return
		}

		const searchParams = new URLSearchParams({
			q: trimmedDraft,
		})

		window.location.hash = `${APP_ROUTES.WORKSPACE_DOCUMENTS}?${searchParams.toString()}`
	}

	function handleImportClick() {
		toast('导入能力还在接入中，下一步会补上真实文件导入链路。')
	}

	function handleChromePointerDownCapture(event: React.PointerEvent<HTMLElement>) {
		const eventTarget = event.target

		if (!(eventTarget instanceof HTMLElement)) {
			return
		}

		if (eventTarget.closest('[data-window-chrome-search-root="true"]')) {
			return
		}

		if (document.activeElement === chromeSearchInputRef.current) {
			chromeSearchInputRef.current?.blur()
		}
	}

	return (
		<header
			data-testid='window-chrome-root'
			data-tauri-drag-region
			onPointerDownCapture={handleChromePointerDownCapture}
			className={cn(
				'window-chrome-drag flex h-13 min-h-13 items-center gap-4 overflow-hidden border-b bg-background/80 backdrop-blur-sm',
				topbarPaddingClass,
				className,
			)}>
			<div
				data-testid='window-chrome-search'
				data-window-chrome-search-root='true'
				className='window-chrome-no-drag flex min-w-0 flex-1 items-center'>
				<form
					className={cn('flex min-w-0 items-center', searchFlexClass)}
					onSubmit={(event) => {
						event.preventDefault()
						submitChromeSearch()
					}}>
					<div className='relative w-full'>
						<SearchIcon className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
						<Input
							ref={chromeSearchInputRef}
							type='search'
							value={chromeSearchDraft}
							className='h-9 rounded-lg border-border/80 bg-card/95 pl-9 pr-3 shadow-sm'
							placeholder='搜索文档标题'
							onChange={(event) => {
								setChromeSearchDraft(event.target.value)
							}}
						/>
					</div>
				</form>
			</div>

			<div
				data-tauri-drag-region
				className='window-chrome-drag min-w-0 flex-[999_1_0%] self-stretch'
			/>

			<div
				data-testid='window-chrome-center-actions'
				className={cn('window-chrome-drag flex h-full shrink-0 items-center gap-2', isMacShell ? 'pr-2' : 'pr-0')}>
				<Button
					type='button'
					variant='outline'
					size='sm'
					className='window-chrome-no-drag h-9 rounded-lg bg-card/95 px-3 shadow-sm'
					onClick={handleImportClick}>
					<DownloadIcon data-icon='inline-start' />
					导入
				</Button>
				<Button
					type='button'
					size='sm'
					className='window-chrome-no-drag h-9 rounded-lg px-3 shadow-none'
					onClick={() => {
						openNewDocumentDialog({
							source: 'window-chrome',
						})
					}}>
					<PlusIcon data-icon='inline-start' />
					新建文档
				</Button>

				{isMacShell ? null : (
					<>
						<Separator
							orientation='vertical'
							className='mx-1 h-4 self-center bg-border/90'
						/>
						<div
							data-testid='windows-window-controls'
							className='window-chrome-no-drag grid h-full grid-cols-3'>
							<button
								type='button'
								className={windowsWindowControlButtonClass}
								title='最小化'
								onClick={() => {
									void runWindowAction('minimize')
								}}>
								<MinusIcon className='size-4' />
							</button>
							<button
								type='button'
								className={windowsWindowControlButtonClass}
								title='最大化或还原'
								onClick={() => {
									void runWindowAction('toggleMaximize')
								}}>
								<SquareIcon className='size-3.5' />
							</button>
							<button
								type='button'
								className={windowsWindowCloseButtonClass}
								title='关闭'
								onClick={() => {
									void runWindowAction('close')
								}}>
								<XIcon className='size-4' />
							</button>
						</div>
					</>
				)}
			</div>
		</header>
	)
}

export default WindowChrome
