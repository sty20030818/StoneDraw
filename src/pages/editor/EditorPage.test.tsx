import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { APP_ROUTES } from '@/constants/routes'
import { useEditorStore } from '@/stores'
import { createDocumentMeta } from '@/test/fixtures/document'
import { createScenePayload } from '@/test/fixtures/scene'
import { renderRoute } from '@/test/helpers/render-route'
import EditorPage from './EditorPage'

const {
	documentGetByIdMock,
	editorLoadSceneMock,
	observeSceneChangeMock,
	scheduleAutoSaveMock,
	flushPendingSaveMock,
	saveNowMock,
	setEditorApiMock,
	clearEditorApiMock,
	cancelScheduledSaveMock,
	setSceneObservationBaselineMock,
	toastMock,
	tauriWindowMock,
} = vi.hoisted(() => ({
	documentGetByIdMock: vi.fn<(...args: never[]) => Promise<unknown>>(),
	editorLoadSceneMock: vi.fn<(...args: never[]) => Promise<unknown>>(),
	observeSceneChangeMock: vi.fn<(...args: never[]) => unknown>(),
	scheduleAutoSaveMock: vi.fn<(...args: never[]) => void>(),
	flushPendingSaveMock: vi.fn<(...args: never[]) => Promise<boolean>>(),
	saveNowMock: vi.fn<(...args: never[]) => Promise<unknown>>(),
	setEditorApiMock: vi.fn<(...args: never[]) => boolean>(() => true),
	clearEditorApiMock: vi.fn<(...args: never[]) => void>(),
	cancelScheduledSaveMock: vi.fn<(...args: never[]) => void>(),
	setSceneObservationBaselineMock: vi.fn<(...args: never[]) => void>(),
	toastMock: vi.fn<(message?: unknown, options?: unknown) => unknown>(),
	tauriWindowMock: (() => {
		let closeHandler: ((event: { preventDefault: () => void }) => void | Promise<void>) | null = null

		return {
			window: {
				onCloseRequested: vi.fn<
					(handler: NonNullable<typeof closeHandler>) => Promise<() => void>
				>(async (handler) => {
					closeHandler = handler
					return () => {
						closeHandler = null
					}
				}),
				destroy: vi.fn<() => Promise<void>>(async () => undefined),
			},
			getCloseHandler() {
				return closeHandler
			},
		}
	})(),
}))

let currentSnapshot = {
	elements: [] as unknown[],
	appState: {} as Record<string, unknown>,
	files: {} as Record<string, unknown>,
}

vi.mock('@excalidraw/excalidraw', async () => {
	const React = await import('react')

	return {
		Excalidraw: ({
			excalidrawAPI,
			onChange,
		}: {
			excalidrawAPI?: (api: unknown) => void
			onChange?: (elements: unknown[], appState: Record<string, unknown>, files: Record<string, unknown>) => void
		}) => {
			React.useEffect(() => {
				excalidrawAPI?.({
					id: 'mock-excalidraw-api',
					getSceneElements: () => currentSnapshot.elements,
					getAppState: () => currentSnapshot.appState,
					getFiles: () => currentSnapshot.files,
				})
			}, [excalidrawAPI])

			return (
				<div>
					<button
						type='button'
						onClick={() => {
							onChange?.(currentSnapshot.elements, currentSnapshot.appState, currentSnapshot.files)
						}}>
						触发画布变化
					</button>
				</div>
			)
		},
	}
})

vi.mock('@tauri-apps/api/window', () => ({
	getCurrentWindow: () => tauriWindowMock.window,
}))

vi.mock('sonner', () => ({
	toast: Object.assign(toastMock, {
		error: toastMock,
		success: toastMock,
	}),
}))

vi.mock('@/services/document.service', () => ({
	documentService: {
		getById: documentGetByIdMock,
	},
}))

vi.mock('@/services/editor.service', () => ({
	editorService: {
		loadScene: editorLoadSceneMock,
	},
}))

vi.mock('@/modules/editor/index', () => ({
	cancelScheduledSave: cancelScheduledSaveMock,
	clearEditorApi: clearEditorApiMock,
	flushPendingSave: flushPendingSaveMock,
	observeSceneChange: observeSceneChangeMock,
	saveNow: saveNowMock,
	scheduleAutoSave: scheduleAutoSaveMock,
	setEditorApi: setEditorApiMock,
	setSceneObservationBaseline: setSceneObservationBaselineMock,
}))

function renderEditorPage(initialEntry = `${APP_ROUTES.EDITOR}?documentId=doc-editor-1`) {
	return renderRoute({
		initialEntry,
		routes: [
			{
				path: APP_ROUTES.EDITOR,
				element: <EditorPage />,
			},
			{
				path: APP_ROUTES.WORKSPACE,
				element: <div>工作区占位</div>,
			},
		],
	})
}

const nativeWindowAddEventListener = window.addEventListener.bind(window)
const nativeWindowRemoveEventListener = window.removeEventListener.bind(window)
let beforeUnloadHandler: ((event: BeforeUnloadEvent) => void) | null = null

describe('EditorPage', () => {
	beforeEach(() => {
		currentSnapshot = {
			elements: [],
			appState: {},
			files: {},
		}
		documentGetByIdMock.mockReset()
		editorLoadSceneMock.mockReset()
		observeSceneChangeMock.mockReset()
		scheduleAutoSaveMock.mockReset()
		flushPendingSaveMock.mockReset()
		saveNowMock.mockReset()
		setEditorApiMock.mockClear()
		clearEditorApiMock.mockClear()
		cancelScheduledSaveMock.mockClear()
		setSceneObservationBaselineMock.mockClear()
		toastMock.mockClear()
		tauriWindowMock.window.onCloseRequested.mockClear()
		tauriWindowMock.window.destroy.mockClear()
		beforeUnloadHandler = null

		vi.spyOn(window, 'addEventListener').mockImplementation((
			type: string,
			listener: EventListenerOrEventListenerObject,
			options?: boolean | AddEventListenerOptions,
		) => {
			if (type === 'beforeunload' && typeof listener === 'function') {
				beforeUnloadHandler = listener as (event: BeforeUnloadEvent) => void
			}

			nativeWindowAddEventListener(type, listener, options)
		})

		vi.spyOn(window, 'removeEventListener').mockImplementation((
			type: string,
			listener: EventListenerOrEventListenerObject,
			options?: boolean | EventListenerOptions,
		) => {
			if (type === 'beforeunload' && beforeUnloadHandler === listener) {
				beforeUnloadHandler = null
			}

			nativeWindowRemoveEventListener(type, listener, options)
		})

		documentGetByIdMock.mockResolvedValue({
			ok: true,
			data: createDocumentMeta({
				id: 'doc-editor-1',
				title: '编辑器文档',
			}),
		})
		editorLoadSceneMock.mockResolvedValue({
			ok: true,
			data: createScenePayload({
				documentId: 'doc-editor-1',
				title: '编辑器文档',
			}),
		})
		observeSceneChangeMock.mockImplementation(() => {
			useEditorStore.getState().setSaveStatus('dirty')
			return createScenePayload({
				documentId: 'doc-editor-1',
				title: '编辑器文档',
				elements: currentSnapshot.elements,
			})
		})
		saveNowMock.mockImplementation(async () => {
			useEditorStore.getState().setSaveStatus('saved')
			return {
				ok: true,
				data: {
					document: createDocumentMeta({
						id: 'doc-editor-1',
						title: '编辑器文档',
						updatedAt: 2,
					}),
					scene: createScenePayload({
						documentId: 'doc-editor-1',
						title: '编辑器文档',
						elements: currentSnapshot.elements,
					}),
				},
			}
		})
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	test('画布变化后应调用 observeSceneChange 与 scheduleAutoSave', async () => {
		const user = userEvent.setup()

		renderEditorPage()

		await screen.findByText('编辑器文档')
		currentSnapshot = {
			elements: [{ id: 'element-1' }],
			appState: {},
			files: {},
		}

		await user.click(screen.getByRole('button', { name: '触发画布变化' }))

		expect(observeSceneChangeMock).toHaveBeenCalledWith(
			'doc-editor-1',
			[{ id: 'element-1' }],
			{},
			{},
			'编辑器文档',
		)
		expect(scheduleAutoSaveMock).toHaveBeenCalledWith(
			expect.objectContaining({
				id: 'doc-editor-1',
				title: '编辑器文档',
			}),
		)
		expect(await screen.findByText('未保存')).toBeInTheDocument()
	})

	test('手动保存成功后应保持在编辑器并回到已保存状态', async () => {
		const user = userEvent.setup()

		renderEditorPage()
		await screen.findByText('编辑器文档')

		act(() => {
			useEditorStore.getState().setSaveStatus('error')
		})

		await user.click(screen.getByRole('button', { name: '重试保存' }))

		expect(saveNowMock).toHaveBeenCalledWith(
			expect.objectContaining({
				id: 'doc-editor-1',
				title: '编辑器文档',
			}),
		)
		expect(await screen.findByText('已保存')).toBeInTheDocument()
		expect(screen.queryByText('工作区占位')).not.toBeInTheDocument()
	})

	test('返回工作区前 flush 失败时应弹出三选项确认，并支持重试保存后离开', async () => {
		const user = userEvent.setup()
		flushPendingSaveMock.mockResolvedValue(false)

		renderEditorPage()
		await screen.findByText('编辑器文档')

		act(() => {
			useEditorStore.getState().setSaveStatus('dirty')
		})

		await user.click(screen.getByRole('button', { name: '返回' }))

		expect(flushPendingSaveMock).toHaveBeenCalledWith(
			expect.objectContaining({
				id: 'doc-editor-1',
				title: '编辑器文档',
			}),
			'route-leave',
		)
		expect(await screen.findByText('离开当前画布？')).toBeInTheDocument()
		expect(screen.getByRole('button', { name: '继续编辑' })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: '放弃修改' })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: '重试保存后离开' })).toBeInTheDocument()

		await user.click(screen.getByRole('button', { name: '重试保存后离开' }))

		await waitFor(() => {
			expect(screen.getByText('工作区占位')).toBeInTheDocument()
		})
	})

	test('窗口关闭前应先 flush，成功后销毁窗口', async () => {
		renderEditorPage()
		await screen.findByText('编辑器文档')

		flushPendingSaveMock.mockResolvedValue(true)

		act(() => {
			useEditorStore.getState().setSaveStatus('dirty')
		})

		const closeHandler = tauriWindowMock.getCloseHandler()
		expect(closeHandler).toBeTypeOf('function')

		const preventDefault = vi.fn<() => void>()
		await closeHandler?.({ preventDefault })

		expect(preventDefault).toHaveBeenCalled()
		expect(flushPendingSaveMock).toHaveBeenCalledWith(
			expect.objectContaining({
				id: 'doc-editor-1',
				title: '编辑器文档',
			}),
			'window-close',
		)
		expect(tauriWindowMock.window.destroy).toHaveBeenCalled()
	})

	test('窗口关闭 flush 失败后选择放弃修改并退出时不应再触发 beforeunload 拦截', async () => {
		const user = userEvent.setup()
		flushPendingSaveMock.mockResolvedValue(false)

		renderEditorPage()
		await screen.findByText('编辑器文档')

		act(() => {
			useEditorStore.getState().setSaveStatus('dirty')
		})

		const closeHandler = tauriWindowMock.getCloseHandler()
		expect(closeHandler).toBeTypeOf('function')

		const preventDefault = vi.fn<() => void>()
		await closeHandler?.({ preventDefault })

		expect(await screen.findByText('关闭应用前保存失败')).toBeInTheDocument()
		expect(beforeUnloadHandler).toBeTypeOf('function')

		await user.click(screen.getByRole('button', { name: '放弃修改并退出' }))

		await waitFor(() => {
			expect(tauriWindowMock.window.destroy).toHaveBeenCalledTimes(1)
		})

		const beforeUnloadEvent = {
			preventDefault: vi.fn<() => void>(),
			returnValue: undefined as string | undefined,
		} as unknown as BeforeUnloadEvent

		beforeUnloadHandler?.(beforeUnloadEvent)

		expect(beforeUnloadEvent.preventDefault).not.toHaveBeenCalled()
		expect(beforeUnloadEvent.returnValue).toBeUndefined()
	})

	test('保存失败错误变化时应提示自动保存失败', async () => {
		renderEditorPage()
		await screen.findByText('编辑器文档')

		act(() => {
			useEditorStore.getState().setLastSaveError('磁盘不可写')
		})

		await waitFor(() => {
			expect(toastMock).toHaveBeenCalledWith('自动保存失败', {
				description: '磁盘不可写',
			})
		})
	})

	test('Ctrl+S 快捷键应触发手动保存', async () => {
		renderEditorPage()
		await screen.findByText('编辑器文档')

		fireEvent.keyDown(window, {
			key: 's',
			ctrlKey: true,
		})

		await waitFor(() => {
			expect(saveNowMock).toHaveBeenCalledTimes(1)
		})
	})
})
