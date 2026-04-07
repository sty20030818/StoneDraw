import { useEffect, useState } from 'react'
import { MinusIcon, SearchIcon, SquareIcon, XIcon } from 'lucide-react'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { Input } from '@/shared/ui/input'
import { APP_ROUTES } from '@/shared/constants/routes'
import { useAppStore } from '@/app/state'
import { useOverlayStore } from '@/features/overlays'
import { useWorkbenchStore } from '@/features/workbench'
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

function WindowChrome() {
	const shellPlatform = detectDesktopShellPlatform()
	const isMacShell = shellPlatform === 'mac'
	const activeSceneKey = useAppStore((state) => state.activeSceneKey)
	const activeRoutePath = useAppStore((state) => state.activeRoutePath)
	const openOverlay = useOverlayStore((state) => state.openOverlay)
	const workbenchSearchDraft = useWorkbenchStore((state) => state.searchDraft)
	const [chromeSearchDraft, setChromeSearchDraft] = useState('')

	useEffect(() => {
		if (activeSceneKey === 'workbench') {
			setChromeSearchDraft(workbenchSearchDraft)
			return
		}

		setChromeSearchDraft(readWorkspaceSearchQuery())
	}, [activeSceneKey, activeRoutePath, workbenchSearchDraft])

	function submitChromeSearch() {
		const trimmedDraft = chromeSearchDraft.trim()

		if (!trimmedDraft) {
			openOverlay('command-palette', {
				source: 'window-chrome',
			})
			return
		}

		if (activeSceneKey === 'workbench') {
			const workbenchStore = useWorkbenchStore.getState()

			workbenchStore.setSearchDraft(trimmedDraft)
			workbenchStore.setActivePanel('search')
			workbenchStore.setSidePanelOpen(true)
			return
		}

		const searchParams = new URLSearchParams({
			q: trimmedDraft,
		})

		window.location.hash = `${APP_ROUTES.WORKSPACE_SEARCH}?${searchParams.toString()}`
	}

	return (
		<header
			className={[
				'grid shrink-0 border-b border-border/60 bg-[linear-gradient(180deg,rgba(249,251,255,0.96),rgba(244,247,253,0.9))] backdrop-blur supports-backdrop-filter:bg-[linear-gradient(180deg,rgba(249,251,255,0.88),rgba(244,247,253,0.78))]',
				isMacShell ? 'h-12 grid-cols-[5.5rem_minmax(0,1fr)]' : 'h-11 grid-cols-[minmax(0,1fr)_8.5rem]',
			].join(' ')}>
			{isMacShell ? (
				<div
					data-testid='mac-window-controls-spacer'
					data-tauri-drag-region
					className='h-full'
				/>
			) : null}

			<div className={isMacShell ? 'flex h-full items-center gap-3 pr-5' : 'flex h-full items-center gap-3 px-5'}>
				{isMacShell ? null : (
					<div
						data-tauri-drag-region
						className='h-full min-w-8 flex-1'
					/>
				)}
				<form
					className='window-chrome-no-drag flex w-full max-w-md shrink-0 items-center'
					onSubmit={(event) => {
						event.preventDefault()
						submitChromeSearch()
					}}>
					<div className='relative w-full max-w-md'>
						<SearchIcon className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
						<Input
							type='search'
							value={chromeSearchDraft}
							className={[
								'pl-9 shadow-[inset_0_1px_0_rgba(255,255,255,0.86)]',
								isMacShell
									? 'h-8 rounded-full border-border/65 bg-white/78'
									: 'h-9 rounded-full border-border/70 bg-[#f6f8fc]',
							].join(' ')}
							placeholder='搜索画布内容（本阶段仅保留输入骨架）'
							onChange={(event) => {
								setChromeSearchDraft(event.target.value)
							}}
						/>
					</div>
				</form>
				<div
					data-tauri-drag-region
					className='h-full min-w-8 flex-1'
				/>
			</div>

			{isMacShell ? null : (
				<div
					data-testid='windows-window-controls'
					className='window-chrome-no-drag grid h-full grid-cols-3'>
					<button
						type='button'
						className='grid h-full place-items-center text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground'
						title='最小化'
						onClick={() => {
							void runWindowAction('minimize')
						}}>
						<MinusIcon className='size-4' />
					</button>
					<button
						type='button'
						className='grid h-full place-items-center text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground'
						title='最大化或还原'
						onClick={() => {
							void runWindowAction('toggleMaximize')
						}}>
						<SquareIcon className='size-3.5' />
					</button>
					<button
						type='button'
						className='grid h-full place-items-center text-muted-foreground transition-colors hover:bg-[#e81123] hover:text-white'
						title='关闭'
						onClick={() => {
							void runWindowAction('close')
						}}>
						<XIcon className='size-4' />
					</button>
				</div>
			)}
		</header>
	)
}

export default WindowChrome
