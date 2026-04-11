import type { ComponentProps } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import WorkbenchResizableShell from './WorkbenchResizableShell'

function renderShell(props?: Partial<ComponentProps<typeof WorkbenchResizableShell>>) {
	return render(
		<WorkbenchResizableShell
			isSidePanelOpen
			sidePanelWidth={320}
			minSidePanelWidth={240}
			maxSidePanelWidth={420}
			onSidePanelWidthCommit={vi.fn()}
			sidebar={<div data-testid='sidebar-content'>侧栏</div>}
			main={<div data-testid='main-content'>主区域</div>}
			{...props}
		/>,
	)
}

describe('WorkbenchResizableShell', () => {
	afterEach(() => {
		cleanup()
		document.body.style.cursor = ''
		document.body.style.userSelect = ''
	})

	test('折叠时不渲染拖拽条和侧栏内容', () => {
		renderShell({
			isSidePanelOpen: false,
		})

		expect(screen.queryByRole('separator')).not.toBeInTheDocument()
		expect(screen.queryByTestId('sidebar-content')).not.toBeInTheDocument()
		expect(screen.getByTestId('main-content')).toBeInTheDocument()
	})

	test('拖拽结束后应提交新的侧栏宽度', () => {
		const handleCommit = vi.fn<(width: number) => void>()

		renderShell({
			onSidePanelWidthCommit: handleCommit,
		})

		const separator = screen.getByRole('separator')
		separator.setPointerCapture = vi.fn()
		separator.releasePointerCapture = vi.fn()

		fireEvent.pointerDown(separator, {
			pointerId: 1,
			clientX: 320,
		})
		fireEvent.pointerMove(window, {
			clientX: 380,
		})
		fireEvent.pointerUp(window, {
			clientX: 380,
		})

		expect(handleCommit).toHaveBeenCalledWith(380)
	})

	test('重新打开侧栏时应继续使用最近一次提交的宽度', () => {
		const { rerender, container } = renderShell({
			sidePanelWidth: 360,
		})

		rerender(
			<WorkbenchResizableShell
				isSidePanelOpen={false}
				sidePanelWidth={360}
				minSidePanelWidth={240}
				maxSidePanelWidth={420}
				onSidePanelWidthCommit={vi.fn()}
				sidebar={<div data-testid='sidebar-content'>侧栏</div>}
				main={<div data-testid='main-content'>主区域</div>}
			/>,
		)

		rerender(
			<WorkbenchResizableShell
				isSidePanelOpen
				sidePanelWidth={360}
				minSidePanelWidth={240}
				maxSidePanelWidth={420}
				onSidePanelWidthCommit={vi.fn()}
				sidebar={<div data-testid='sidebar-content'>侧栏</div>}
				main={<div data-testid='main-content'>主区域</div>}
			/>,
		)

		expect(container.firstChild).toHaveStyle('--workbench-side-panel-width: 360px')
	})
})
