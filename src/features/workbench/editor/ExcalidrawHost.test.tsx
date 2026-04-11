import { render, waitFor } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { createScenePayload } from '@/test/fixtures/scene'
import ExcalidrawHost from './ExcalidrawHost'

const {
	clearEditorApiMock,
	createWorkbenchInitialSceneDataMock,
	restoreSceneToWorkbenchMock,
	setEditorApiMock,
} = vi.hoisted(() => ({
	clearEditorApiMock: vi.fn<() => void>(),
	createWorkbenchInitialSceneDataMock: vi.fn(() => ({
		elements: [],
		appState: {},
		files: {},
	})),
	restoreSceneToWorkbenchMock: vi.fn<(...args: unknown[]) => void>(),
	setEditorApiMock: vi.fn<(...args: unknown[]) => void>(),
}))

let latestExcalidrawProps: Record<string, unknown> | null = null

vi.mock('@excalidraw/excalidraw', async () => {
	const React = await import('react')

	return {
		Excalidraw: (props: Record<string, unknown>) => {
			latestExcalidrawProps = props

			React.useEffect(() => {
				const excalidrawApi = props.excalidrawAPI as ((api: unknown) => void) | undefined

				excalidrawApi?.({
					id: 'mock-excalidraw-api',
					updateScene: () => undefined,
				})
			}, [props])

			return (
				<div data-testid='mock-excalidraw-root'>
					<button
						type='button'
						className='main-menu-trigger'>
						菜单
					</button>
					<button
						type='button'
						className='default-sidebar-trigger'>
						侧栏
					</button>
					<button
						type='button'
						className='help-icon'>
						帮助
					</button>
				</div>
			)
		},
	}
})

vi.mock('./editor-runtime', () => ({
	clearEditorApi: clearEditorApiMock,
	setEditorApi: setEditorApiMock,
}))

vi.mock('./scene-restore-bridge', () => ({
	createWorkbenchInitialSceneData: createWorkbenchInitialSceneDataMock,
	restoreSceneToWorkbench: restoreSceneToWorkbenchMock,
}))

vi.mock('./editor-event-bridge', () => ({
	createEditorEventBridge: () => ({
		handleContentChange: vi.fn<(...args: unknown[]) => void>(),
	}),
}))

describe('ExcalidrawHost', () => {
	test('应向 Excalidraw 传入受限 UI 选项并关闭右上插槽', async () => {
		latestExcalidrawProps = null

	render(<ExcalidrawHost scene={createScenePayload()} />)

		await waitFor(() => {
			expect(latestExcalidrawProps).not.toBeNull()
		})

		if (!latestExcalidrawProps) {
			throw new Error('Excalidraw props 未被捕获')
		}

		const excalidrawProps = latestExcalidrawProps as unknown as {
			theme: string
			langCode: string
			renderTopRightUI?: () => unknown
			UIOptions: unknown
		}

		expect(excalidrawProps.theme).toBe('light')
		expect(excalidrawProps.langCode).toBe('zh-CN')
		expect(excalidrawProps.renderTopRightUI).toBeTypeOf('function')
		expect((excalidrawProps.renderTopRightUI as (() => unknown) | undefined)?.()).toBeNull()
		expect(excalidrawProps.UIOptions).toMatchObject({
			canvasActions: {
				changeViewBackgroundColor: false,
				clearCanvas: false,
				export: false,
				loadScene: false,
				saveAsImage: false,
				saveToActiveFile: false,
				toggleTheme: false,
			},
		})
	})

	test('兼容层只应隐藏 host 内部的 Excalidraw chrome', async () => {
		const externalHelpButton = document.createElement('button')
		externalHelpButton.className = 'help-icon'
		externalHelpButton.textContent = '外部帮助'
		document.body.appendChild(externalHelpButton)

		const { container, unmount } = render(<ExcalidrawHost scene={createScenePayload()} />)

		await waitFor(() => {
			expect(container.querySelector<HTMLElement>('.main-menu-trigger')?.style.display).toBe('none')
			expect(container.querySelector<HTMLElement>('.default-sidebar-trigger')?.style.display).toBe('none')
			expect(container.querySelector<HTMLElement>('.help-icon')?.style.display).toBe('none')
		})

		expect(externalHelpButton.style.display).toBe('')

		unmount()
		externalHelpButton.remove()
	})
})
