import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { APP_ROUTES } from '@/constants/routes'
import { useEditorStore } from '@/stores'
import { createDocumentMeta } from '@/test/fixtures/document'
import { createScenePayload } from '@/test/fixtures/scene'
import { renderRoute } from '@/test/helpers/render-route'
import EditorPage from './EditorPage'

const {
	documentGetByIdMock,
	editorLoadSceneMock,
	initializeMock,
	onSceneChangeMock,
	flushBeforeLeaveMock,
	saveNowMock,
	disposeMock,
	setEditorApiMock,
	clearEditorApiMock,
	toastMock,
	tauriWindowMock,
} = vi.hoisted(() => ({
	documentGetByIdMock: vi.fn<(...args: never[]) => Promise<unknown>>(),
	editorLoadSceneMock: vi.fn<(...args: never[]) => Promise<unknown>>(),
	initializeMock: vi.fn<(...args: never[]) => void>(),
	onSceneChangeMock: vi.fn<(...args: never[]) => unknown>(),
	flushBeforeLeaveMock: vi.fn<(...args: never[]) => Promise<boolean>>(),
	saveNowMock: vi.fn<(...args: never[]) => Promise<unknown>>(),
	disposeMock: vi.fn<(...args: never[]) => void>(),
	setEditorApiMock: vi.fn<(...args: never[]) => boolean>(() => true),
	clearEditorApiMock: vi.fn<(...args: never[]) => void>(),
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

vi.mock('@/services/documents/document.service', () => ({
	documentService: {
		getById: documentGetByIdMock,
	},
}))

vi.mock('@/services/workbench/editor.service', () => ({
	editorService: {
		loadScene: editorLoadSceneMock,
	},
}))

vi.mock('@/modules/editor/index', () => ({
	clearEditorApi: clearEditorApiMock,
	editorSaveSession: {
		initialize: initializeMock,
		onSceneChange: onSceneChangeMock,
		saveNow: saveNowMock,
		flushBeforeLeave: flushBeforeLeaveMock,
		dispose: disposeMock,
	},
	setEditorApi: setEditorApiMock,
}))

function renderEditorPage(initialEntry = `${APP_ROUTES.WORKBENCH}?documentId=doc-editor-1`) {
	return renderRoute({
		initialEntry,
		routes: [
			{
				path: APP_ROUTES.WORKBENCH,
				element: <EditorPage />,
			},
			{
				path: APP_ROUTES.WORKSPACE,
				element: <div>工作区占位</div>,
			},
		],
	})
}

describe('EditorPage', () => {
	beforeEach(() => {
		currentSnapshot = {
			elements: [],
			appState: {},
			files: {},
		}
		documentGetByIdMock.mockReset()
		editorLoadSceneMock.mockReset()
		initializeMock.mockReset()
		onSceneChangeMock.mockReset()
		flushBeforeLeaveMock.mockReset()
		saveNowMock.mockReset()
		disposeMock.mockReset()
		setEditorApiMock.mockClear()
		clearEditorApiMock.mockClear()
		toastMock.mockClear()
		tauriWindowMock.window.onCloseRequested.mockClear()
		tauriWindowMock.window.destroy.mockClear()

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
		initializeMock.mockImplementation(() => {
			useEditorStore.getState().setSaveStatus('saved')
			useEditorStore.getState().setLastSaveError(null)
		})
		onSceneChangeMock.mockImplementation(() => {
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
		disposeMock.mockImplementation(() => {
			useEditorStore.getState().setSaveStatus('idle')
			useEditorStore.getState().setLastSaveError(null)
			useEditorStore.getState().setIsFlushing(false)
		})
	})

	test('加载完成后应初始化保存会话', async () => {
		renderEditorPage()

		await screen.findByText('编辑器文档')

		expect(initializeMock).toHaveBeenCalledWith(
			expect.objectContaining({
				documentId: 'doc-editor-1',
			}),
		)
	})

	test('画布变化后应调用保存会话 onSceneChange', async () => {
		const user = userEvent.setup()

		renderEditorPage()

		await screen.findByText('编辑器文档')
		currentSnapshot = {
			elements: [{ id: 'element-1' }],
			appState: {},
			files: {},
		}

		await user.click(screen.getByRole('button', { name: '触发画布变化' }))

		expect(onSceneChangeMock).toHaveBeenCalledWith(
			expect.objectContaining({
				id: 'doc-editor-1',
				title: '编辑器文档',
			}),
			[{ id: 'element-1' }],
			{},
			{},
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

	test('返回工作区前 flush 失败时应直接离开，并提示最近修改可能未保存', async () => {
		const user = userEvent.setup()
		flushBeforeLeaveMock.mockResolvedValue(false)

		renderEditorPage()
		await screen.findByText('编辑器文档')

		act(() => {
			useEditorStore.getState().setSaveStatus('dirty')
		})

		await user.click(screen.getByRole('button', { name: '返回' }))

		expect(flushBeforeLeaveMock).toHaveBeenCalledWith(
			expect.objectContaining({
				id: 'doc-editor-1',
				title: '编辑器文档',
			}),
			undefined,
		)
		await waitFor(() => {
			expect(screen.getByText('工作区占位')).toBeInTheDocument()
		})
		expect(toastMock).toHaveBeenCalledWith('自动保存未完成', {
			description: '系统已继续离开当前页面，最近修改可能未保存。',
		})
	})

	test('窗口关闭前应先 flush，成功后销毁窗口', async () => {
		renderEditorPage()
		await screen.findByText('编辑器文档')

		flushBeforeLeaveMock.mockResolvedValue(true)

		act(() => {
			useEditorStore.getState().setSaveStatus('dirty')
		})

		const closeHandler = tauriWindowMock.getCloseHandler()
		expect(closeHandler).toBeTypeOf('function')

		const preventDefault = vi.fn<() => void>()
		await closeHandler?.({ preventDefault })

		expect(preventDefault).toHaveBeenCalled()
		expect(flushBeforeLeaveMock).toHaveBeenCalledWith(
			expect.objectContaining({
				id: 'doc-editor-1',
				title: '编辑器文档',
			}),
			{
				timeoutMs: 2000,
			},
		)
		expect(tauriWindowMock.window.destroy).toHaveBeenCalled()
	})

	test('窗口关闭 flush 失败时应直接销毁窗口', async () => {
		flushBeforeLeaveMock.mockResolvedValue(false)

		renderEditorPage()
		await screen.findByText('编辑器文档')

		act(() => {
			useEditorStore.getState().setSaveStatus('dirty')
		})

		const closeHandler = tauriWindowMock.getCloseHandler()
		expect(closeHandler).toBeTypeOf('function')

		const preventDefault = vi.fn<() => void>()
		await closeHandler?.({ preventDefault })

		await waitFor(() => {
			expect(tauriWindowMock.window.destroy).toHaveBeenCalledTimes(1)
		})
		expect(preventDefault).toHaveBeenCalled()
		expect(flushBeforeLeaveMock).toHaveBeenCalledWith(
			expect.objectContaining({
				id: 'doc-editor-1',
				title: '编辑器文档',
			}),
			{
				timeoutMs: 2000,
			},
		)
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
