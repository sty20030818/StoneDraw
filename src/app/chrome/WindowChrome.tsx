import { useEffect, useState } from 'react'
import { MinusIcon, SearchIcon, SquareIcon, XIcon } from 'lucide-react'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { Input } from '@/components/ui/input'
import { APP_ROUTES } from '@/constants/routes'
import { useAppStore } from '@/stores/app.store'
import { useOverlayStore } from '@/stores/overlay.store'
import { useWorkbenchStore } from '@/stores/workbench.store'

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
		<header className='grid h-11 shrink-0 grid-cols-[minmax(0,1fr)_8.5rem] border-b border-border/60 bg-[linear-gradient(180deg,rgba(249,251,255,0.96),rgba(244,247,253,0.9))] backdrop-blur supports-[backdrop-filter]:bg-[linear-gradient(180deg,rgba(249,251,255,0.88),rgba(244,247,253,0.78))]'>
			<div className='flex h-full items-center gap-3 px-5'>
				<div
					data-tauri-drag-region
					className='h-full min-w-8 flex-1'
				/>
				<form
					className='window-chrome-no-drag flex w-full max-w-[28rem] shrink-0 items-center'
					onSubmit={(event) => {
						event.preventDefault()
						submitChromeSearch()
					}}>
					<div className='relative w-full max-w-[28rem]'>
						<SearchIcon className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
						<Input
							type='search'
							value={chromeSearchDraft}
							className='h-9 rounded-full border-border/70 bg-[#f6f8fc] pl-9 shadow-[inset_0_1px_0_rgba(255,255,255,0.86)]'
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

			<div className='window-chrome-no-drag grid h-full grid-cols-3'>
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
		</header>
	)
}

export default WindowChrome
