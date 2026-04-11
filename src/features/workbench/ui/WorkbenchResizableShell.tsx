import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import { useEffect, useLayoutEffect, useRef } from 'react'

type WorkbenchResizableShellProps = {
	isSidePanelOpen: boolean
	sidePanelWidth: number
	minSidePanelWidth: number
	maxSidePanelWidth: number
	onSidePanelWidthCommit: (width: number) => void
	sidebar: ReactNode
	main: ReactNode
}

function clampSidePanelWidth(width: number, minWidth: number, maxWidth: number) {
	return Math.min(maxWidth, Math.max(minWidth, Math.round(width)))
}

function WorkbenchResizableShell({
	isSidePanelOpen,
	sidePanelWidth,
	minSidePanelWidth,
	maxSidePanelWidth,
	onSidePanelWidthCommit,
	sidebar,
	main,
}: WorkbenchResizableShellProps) {
	const rootRef = useRef<HTMLDivElement | null>(null)
	const handleRef = useRef<HTMLDivElement | null>(null)
	const lastExpandedWidthRef = useRef(clampSidePanelWidth(sidePanelWidth, minSidePanelWidth, maxSidePanelWidth))
	const dragWidthRef = useRef(lastExpandedWidthRef.current)
	const isDraggingRef = useRef(false)
	const dragCleanupRef = useRef<(() => void) | null>(null)

	function applySidebarWidth(width: number) {
		const rootElement = rootRef.current

		if (!rootElement) {
			return
		}

		rootElement.style.setProperty('--workbench-side-panel-width', `${width}px`)
	}

	useLayoutEffect(() => {
		const clampedWidth = clampSidePanelWidth(sidePanelWidth, minSidePanelWidth, maxSidePanelWidth)

		if (!isDraggingRef.current) {
			lastExpandedWidthRef.current = clampedWidth
			dragWidthRef.current = clampedWidth
		}

		applySidebarWidth(isSidePanelOpen ? (isDraggingRef.current ? dragWidthRef.current : clampedWidth) : 0)
	}, [isSidePanelOpen, maxSidePanelWidth, minSidePanelWidth, sidePanelWidth])

	useEffect(
		() => () => {
			dragCleanupRef.current?.()
		},
		[],
	)

	function handleResizeStart(event: ReactPointerEvent<HTMLDivElement>) {
		if (!isSidePanelOpen) {
			return
		}

		event.preventDefault()

		const separatorElement = handleRef.current
		const startingWidth = dragWidthRef.current
		const startingPointerX = event.clientX

		isDraggingRef.current = true
		separatorElement?.setPointerCapture?.(event.pointerId)
		document.body.style.cursor = 'col-resize'
		document.body.style.userSelect = 'none'

		const finishResize = () => {
			if (!isDraggingRef.current) {
				return
			}

			isDraggingRef.current = false
			dragCleanupRef.current = null
			document.body.style.cursor = ''
			document.body.style.userSelect = ''

			const committedWidth = clampSidePanelWidth(dragWidthRef.current, minSidePanelWidth, maxSidePanelWidth)
			lastExpandedWidthRef.current = committedWidth
			dragWidthRef.current = committedWidth
			applySidebarWidth(committedWidth)
			onSidePanelWidthCommit(committedWidth)
		}

		const handlePointerMove = (moveEvent: PointerEvent) => {
			const nextWidth = clampSidePanelWidth(
				startingWidth + moveEvent.clientX - startingPointerX,
				minSidePanelWidth,
				maxSidePanelWidth,
			)

			dragWidthRef.current = nextWidth
			lastExpandedWidthRef.current = nextWidth
			applySidebarWidth(nextWidth)
		}

		const handlePointerUp = () => {
			window.removeEventListener('pointermove', handlePointerMove)
			window.removeEventListener('pointerup', handlePointerUp)
			window.removeEventListener('pointercancel', handlePointerUp)
			separatorElement?.releasePointerCapture?.(event.pointerId)
			finishResize()
		}

		dragCleanupRef.current = () => {
			window.removeEventListener('pointermove', handlePointerMove)
			window.removeEventListener('pointerup', handlePointerUp)
			window.removeEventListener('pointercancel', handlePointerUp)
			separatorElement?.releasePointerCapture?.(event.pointerId)
			document.body.style.cursor = ''
			document.body.style.userSelect = ''
			isDraggingRef.current = false
		}

		window.addEventListener('pointermove', handlePointerMove)
		window.addEventListener('pointerup', handlePointerUp)
		window.addEventListener('pointercancel', handlePointerUp)
	}

	const rootStyle = {
		'--workbench-side-panel-width': isSidePanelOpen ? `${lastExpandedWidthRef.current}px` : '0px',
	} as CSSProperties

	return (
		<div
			ref={rootRef}
			className='flex h-full min-h-0 w-full'
			style={rootStyle}>
			<div
				className='min-w-0 shrink-0 overflow-hidden'
				style={{ width: 'var(--workbench-side-panel-width)' }}>
				{isSidePanelOpen ? sidebar : null}
			</div>
				{isSidePanelOpen ? (
					<div
						ref={handleRef}
						role='separator'
						aria-orientation='vertical'
						aria-label='调整工作台侧栏宽度'
						className='relative w-px shrink-0 cursor-col-resize touch-none select-none bg-border/80 transition-colors hover:bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-3 after:-translate-x-1/2 after:content-[""]'
						onPointerDown={handleResizeStart}
					/>
				) : null}
			<div className='min-w-0 flex-1'>{main}</div>
		</div>
	)
}

export default WorkbenchResizableShell
