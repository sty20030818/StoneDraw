import { useEffect, useRef, useState } from 'react'
import { DownloadIcon, MinusIcon, PlusIcon, SearchIcon, SquareIcon, XIcon } from 'lucide-react'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { toast } from 'sonner'
import { useOverlayStore } from '@/features/overlays'
import { useAppStore } from '@/app/state'
import { APP_ROUTES } from '@/shared/constants/routes'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Separator } from '@/shared/ui/separator'
import { detectDesktopShellPlatform } from './desktop-shell'

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

type AppShellHeaderProps = {
	scene: 'workspace' | 'workbench'
	className?: string
}

function AppShellHeader({ scene, className }: AppShellHeaderProps) {
	const shellPlatform = detectDesktopShellPlatform()
	const isMacShell = shellPlatform === 'mac'
	const activeRoutePath = useAppStore((state) => state.activeRoutePath)
	const openNewDocumentDialog = useOverlayStore((state) => state.openNewDocumentDialog)
	const [chromeSearchDraft, setChromeSearchDraft] = useState('')
	const [centerGuardWidth, setCenterGuardWidth] = useState(0)
	const chromeSearchInputRef = useRef<HTMLInputElement | null>(null)
	const leadingGroupRef = useRef<HTMLDivElement | null>(null)
	const trailingGroupRef = useRef<HTMLDivElement | null>(null)
	const windowsWindowControlButtonBaseClass =
		'grid h-full w-full min-w-0 place-items-center text-muted-foreground transition-colors'
	const windowsWindowControlButtonClass = `${windowsWindowControlButtonBaseClass} hover:bg-foreground/8 hover:text-foreground`
	const windowsWindowCloseButtonClass = `${windowsWindowControlButtonBaseClass} hover:bg-destructive hover:text-primary-foreground`
	const windowsWindowControlsFrameClass =
		'app-shell-no-drag grid h-10 w-31 shrink-0 grid-cols-3 overflow-hidden rounded-[10px] border border-border/70 bg-background/75 shadow-[0_8px_18px_rgba(15,23,42,0.08)] backdrop-blur-sm'
	const headerPaddingClass =
		scene === 'workspace' ? (isMacShell ? 'pl-20 pr-3' : 'pl-4 pr-0') : isMacShell ? 'pl-20 pr-3' : 'pl-4 pr-0'

	useEffect(() => {
		setChromeSearchDraft(readWorkspaceSearchQuery())
	}, [activeRoutePath])

	useEffect(() => {
		if (typeof window === 'undefined') {
			return
		}

		function measureCenterGuardWidth() {
			const leadingWidth = leadingGroupRef.current?.offsetWidth ?? 0
			const trailingWidth = trailingGroupRef.current?.offsetWidth ?? 0
			const nextGuardWidth = Math.max(leadingWidth, trailingWidth) + 24

			setCenterGuardWidth(nextGuardWidth)
		}

		measureCenterGuardWidth()

		window.addEventListener('resize', measureCenterGuardWidth)

		return () => {
			window.removeEventListener('resize', measureCenterGuardWidth)
		}
	}, [isMacShell, scene])

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

		if (eventTarget.closest('[data-app-shell-header-search-root="true"]')) {
			return
		}

		if (document.activeElement === chromeSearchInputRef.current) {
			chromeSearchInputRef.current?.blur()
		}
	}

	return (
		<header
			data-testid='app-shell-header-root'
			data-tauri-drag-region
			onPointerDownCapture={handleChromePointerDownCapture}
			className={cn(
				'app-shell-drag relative isolate flex h-14 min-h-14 items-center overflow-hidden border-b bg-card',
				headerPaddingClass,
				className,
			)}>
			<div
				data-testid='app-shell-header-chrome'
				data-tauri-drag-region
				className='app-shell-drag flex h-full min-w-0 flex-1 items-center justify-between gap-4'>
				<div
					ref={leadingGroupRef}
					data-testid='app-shell-header-leading'
					data-tauri-drag-region
					className='app-shell-drag flex min-w-0 items-center gap-2.5'>
					<div
						data-tauri-drag-region
						className='app-shell-drag flex size-7 shrink-0 items-center justify-center rounded-md border bg-background shadow-sm'>
						<img
							src='/favicon.svg'
							alt='StoneDraw 图标'
							draggable={false}
							className='size-6'
						/>
					</div>
					<p
						data-tauri-drag-region
						className='app-shell-drag truncate text-lg font-bold tracking-tight text-foreground'>
						StoneDraw
					</p>
				</div>

				<div
					ref={trailingGroupRef}
					data-testid='app-shell-header-actions'
					data-tauri-drag-region
					className={cn('app-shell-drag flex h-full min-w-0 items-center gap-2', isMacShell ? 'pr-2' : 'pr-3')}>
					<Button
						type='button'
						variant='outline'
						size='sm'
						className='app-shell-no-drag h-10 rounded-lg bg-card/95 px-3 shadow-sm'
						onClick={handleImportClick}>
						<DownloadIcon data-icon='inline-center' />
						导入
					</Button>
					<Button
						type='button'
						size='sm'
						className='app-shell-no-drag h-10 rounded-lg px-3 shadow-none'
						onClick={() => {
							openNewDocumentDialog({
								source: 'app-shell-header',
							})
						}}>
						<PlusIcon data-icon='inline-center' />
						新建文档
					</Button>

					{isMacShell ? null : (
						<>
							<Separator
								orientation='vertical'
								data-tauri-drag-region
								className='app-shell-drag mx-1 my-4 bg-border/90'
							/>
							<div
								data-testid='windows-window-controls'
								className={windowsWindowControlsFrameClass}>
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
			</div>

			<div
				data-testid='app-shell-header-search-overlay'
				data-tauri-drag-region
				className='app-shell-drag pointer-events-none absolute inset-y-0 left-1/2 flex w-full -translate-x-1/2 items-center justify-center'
				style={{
					paddingInline: `${centerGuardWidth}px`,
				}}>
				<div
					data-testid='app-shell-header-search'
					data-app-shell-header-search-root='true'
					className='app-shell-no-drag pointer-events-auto w-full min-w-0 max-w-md'>
					<form
						className='flex min-w-0 items-center'
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
								className='h-10 rounded-lg border-border/80 bg-card/95 pl-9 pr-3 shadow-sm'
								placeholder='搜索文档标题'
								onChange={(event) => {
									setChromeSearchDraft(event.target.value)
								}}
							/>
						</div>
					</form>
				</div>
			</div>
		</header>
	)
}

export default AppShellHeader
