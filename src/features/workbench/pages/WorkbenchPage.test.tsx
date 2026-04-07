import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { APP_ROUTES } from '@/shared/constants/routes'
import { WorkbenchShellProvider, useWorkbenchShell, type WorkbenchShellState, useWorkbenchStore } from '@/features/workbench'
import { createAppError } from '@/test/fixtures/error'
import { createDocumentMeta } from '@/test/fixtures/document'
import { createScenePayload } from '@/test/fixtures/scene'
import { createDocumentVersionMeta } from '@/test/fixtures/version'
import { renderRoute } from '@/test/helpers/render-route'
import { resetTestState } from '@/test/helpers/reset-state'
import type { DocumentVersionMeta, TauriCommandResult } from '@/shared/types'
import WorkbenchPage from './WorkbenchPage'

const {
	openDocumentMock,
	initializeMock,
	onSceneChangeMock,
	flushBeforeLeaveMock,
	saveNowMock,
	createManualVersionMock,
	disposeMock,
	setSelectedDocumentIdMock,
	syncWorkspaceCollectionsMock,
	toastMock,
	tauriWindowMock,
} = vi.hoisted(() => ({
	openDocumentMock: vi.fn<(...args: never[]) => Promise<unknown>>(),
	initializeMock: vi.fn<(...args: never[]) => void>(),
	onSceneChangeMock: vi.fn<(...args: never[]) => unknown>(),
	flushBeforeLeaveMock: vi.fn<(...args: never[]) => Promise<boolean>>(),
	saveNowMock: vi.fn<(...args: never[]) => Promise<unknown>>(),
	createManualVersionMock: vi.fn<(...args: never[]) => Promise<unknown>>(),
	disposeMock: vi.fn<(...args: never[]) => void>(),
	setSelectedDocumentIdMock: vi.fn<(...args: never[]) => void>(),
	syncWorkspaceCollectionsMock: vi.fn<(...args: never[]) => void>(),
	toastMock: vi.fn<(message?: unknown, options?: unknown) => unknown>(),
	tauriWindowMock: (() => {
		let closeHandler: ((event: { preventDefault: () => void }) => void | Promise<void>) | null = null

		return {
			window: {
				onCloseRequested: vi.fn<(handler: NonNullable<typeof closeHandler>) => Promise<() => void>>(async (handler) => {
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
let currentShellState: WorkbenchShellState | null = null
let initialShellState: WorkbenchShellState | null = null

function WorkbenchShellProbe() {
	const { shellState } = useWorkbenchShell()

	currentShellState = shellState
	initialShellState ??= shellState

	return null
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
					updateScene: () => undefined,
					addFiles: () => undefined,
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

vi.mock('@/features/documents', () => ({
	documentService: {
		openDocument: openDocumentMock,
	},
	versionService: {
		createManualVersion: createManualVersionMock,
	},
	useDocumentStore: (
		selector: (state: {
			setSelectedDocumentId: typeof setSelectedDocumentIdMock
			syncWorkspaceCollections: typeof syncWorkspaceCollectionsMock
		}) => unknown,
	) =>
		selector({
			setSelectedDocumentId: setSelectedDocumentIdMock,
			syncWorkspaceCollections: syncWorkspaceCollectionsMock,
		}),
}))

vi.mock('@/features/workbench/services', () => ({
	documentPersistenceSession: {
		initialize: initializeMock,
		onSceneChange: onSceneChangeMock,
		saveNow: saveNowMock,
		flushBeforeLeave: flushBeforeLeaveMock,
		dispose: disposeMock,
	},
}))

function renderWorkbenchPage(initialEntry = `${APP_ROUTES.WORKBENCH}?documentId=doc-editor-1`) {
	currentShellState = null
	initialShellState = null

	return renderRoute({
		initialEntry,
		routes: [
			{
				path: APP_ROUTES.WORKBENCH,
				element: (
					<WorkbenchShellProvider>
						<WorkbenchShellProbe />
						<WorkbenchPage />
					</WorkbenchShellProvider>
				),
			},
			{
				path: APP_ROUTES.WORKSPACE_HOME,
				element: <div>工作区首页占位</div>,
			},
		],
	})
}

async function waitForShellActionsReady() {
	await waitFor(() => {
		expect(currentShellState).not.toBeNull()
		expect(currentShellState).not.toBe(initialShellState)
	})
}

function getShellState() {
	expect(currentShellState).not.toBeNull()

	return currentShellState as WorkbenchShellState
}

describe('WorkbenchPage', () => {
	beforeEach(() => {
		currentSnapshot = {
			elements: [],
			appState: {},
			files: {},
		}
		resetTestState()
		openDocumentMock.mockReset()
		initializeMock.mockReset()
		onSceneChangeMock.mockReset()
		flushBeforeLeaveMock.mockReset()
		saveNowMock.mockReset()
		createManualVersionMock.mockReset()
		disposeMock.mockReset()
		setSelectedDocumentIdMock.mockReset()
		syncWorkspaceCollectionsMock.mockReset()
		toastMock.mockClear()
		tauriWindowMock.window.onCloseRequested.mockClear()
		tauriWindowMock.window.destroy.mockClear()

		openDocumentMock.mockResolvedValue({
			ok: true,
			data: {
				document: createDocumentMeta({
					id: 'doc-editor-1',
					title: '编辑器文档',
				}),
				scene: createScenePayload({
					documentId: 'doc-editor-1',
					title: '编辑器文档',
				}),
				collections: {
					documents: [],
					recentDocuments: [],
					trashedDocuments: [],
				},
			},
		})
		initializeMock.mockImplementation(() => {
			useWorkbenchStore.getState().setSaveStatus('saved')
			useWorkbenchStore.getState().setLastSaveError(null)
		})
		onSceneChangeMock.mockImplementation(() => {
			useWorkbenchStore.getState().setSaveStatus('dirty')
			return createScenePayload({
				documentId: 'doc-editor-1',
				title: '编辑器文档',
				elements: currentSnapshot.elements,
			})
		})
		saveNowMock.mockImplementation(async () => {
			useWorkbenchStore.getState().setSaveStatus('saved')
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
		createManualVersionMock.mockResolvedValue({
			ok: true,
			data: createDocumentVersionMeta({
				documentId: 'doc-editor-1',
			}),
		})
		disposeMock.mockImplementation(() => {
			useWorkbenchStore.getState().setSaveStatus('idle')
			useWorkbenchStore.getState().setLastSaveError(null)
			useWorkbenchStore.getState().setIsFlushing(false)
		})
	})

	test('加载完成后应初始化 persistence session', async () => {
		renderWorkbenchPage()

		await screen.findByRole('button', { name: '触发画布变化' })

		await waitFor(() => {
			expect(initializeMock).toHaveBeenCalledWith(
				expect.objectContaining({
					documentId: 'doc-editor-1',
				}),
			)
		})
	})

	test('画布变化后应调用 persistence session onSceneChange', async () => {
		const user = userEvent.setup()

		renderWorkbenchPage()
		await screen.findByRole('button', { name: '触发画布变化' })
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
		expect(useWorkbenchStore.getState().saveStatus).toBe('dirty')
	})

	test('标题栏保存动作应触发手动保存并回到已保存状态', async () => {
		renderWorkbenchPage()
		await screen.findByRole('button', { name: '触发画布变化' })
		await waitForShellActionsReady()
		await waitFor(() => {
			expect(useWorkbenchStore.getState().activeDocumentId).toBe('doc-editor-1')
		})

		act(() => {
			useWorkbenchStore.getState().setSaveStatus('error')
		})

		act(() => {
			getShellState().onSave()
		})

		await waitFor(() => {
			expect(saveNowMock).toHaveBeenCalledWith(
				expect.objectContaining({
					id: 'doc-editor-1',
					title: '编辑器文档',
				}),
			)
			expect(useWorkbenchStore.getState().saveStatus).toBe('saved')
		})
	})

	test('创建版本动作应先保存 current 再创建手动版本', async () => {
		renderWorkbenchPage()
		await screen.findByRole('button', { name: '触发画布变化' })
		await waitForShellActionsReady()

		let createResult: TauriCommandResult<DocumentVersionMeta> | null = null

		await act(async () => {
			createResult = await getShellState().onCreateVersion()
		})

		expect(saveNowMock).toHaveBeenCalledWith(
			expect.objectContaining({
				id: 'doc-editor-1',
				title: '编辑器文档',
			}),
		)
		expect(createManualVersionMock).toHaveBeenCalledWith('doc-editor-1')
		expect(createResult).toEqual({
			ok: true,
			data: createDocumentVersionMeta({
				documentId: 'doc-editor-1',
			}),
		})
	})

	test('返回工作区前 flush 失败时应直接离开，并提示最近修改可能未保存', async () => {
		flushBeforeLeaveMock.mockResolvedValue(false)

		renderWorkbenchPage()
		await screen.findByRole('button', { name: '触发画布变化' })
		await waitForShellActionsReady()

		act(() => {
			useWorkbenchStore.getState().setSaveStatus('dirty')
		})

		act(() => {
			getShellState().onBack()
		})

		await waitFor(() => {
			expect(flushBeforeLeaveMock).toHaveBeenCalledWith(
				expect.objectContaining({
					id: 'doc-editor-1',
					title: '编辑器文档',
				}),
				undefined,
			)
			expect(screen.getByText('工作区首页占位')).toBeInTheDocument()
		})
		expect(toastMock).toHaveBeenCalledWith('自动保存未完成', {
			description: '系统已继续离开当前页面，最近修改可能未保存。',
		})
	})

	test('窗口关闭前应先 flush，成功后销毁窗口', async () => {
		renderWorkbenchPage()
		await screen.findByRole('button', { name: '触发画布变化' })

		flushBeforeLeaveMock.mockResolvedValue(true)

		act(() => {
			useWorkbenchStore.getState().setSaveStatus('dirty')
		})

		await waitFor(() => {
			expect(tauriWindowMock.getCloseHandler()).toBeTypeOf('function')
		})

		const preventDefault = vi.fn<() => void>()
		await tauriWindowMock.getCloseHandler()?.({ preventDefault })

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

		renderWorkbenchPage()
		await screen.findByRole('button', { name: '触发画布变化' })

		act(() => {
			useWorkbenchStore.getState().setSaveStatus('dirty')
		})

		await waitFor(() => {
			expect(tauriWindowMock.getCloseHandler()).toBeTypeOf('function')
		})

		const preventDefault = vi.fn<() => void>()
		await tauriWindowMock.getCloseHandler()?.({ preventDefault })

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
		renderWorkbenchPage()
		await screen.findByRole('button', { name: '触发画布变化' })

		act(() => {
			useWorkbenchStore.getState().setLastSaveError('磁盘不可写')
		})

		await waitFor(() => {
			expect(toastMock).toHaveBeenCalledWith('自动保存失败', {
				description: '磁盘不可写',
			})
		})
	})

	test('Ctrl+S 快捷键应触发手动保存', async () => {
		renderWorkbenchPage()
		await screen.findByRole('button', { name: '触发画布变化' })

		fireEvent.keyDown(window, {
			key: 's',
			ctrlKey: true,
		})

		await waitFor(() => {
			expect(saveNowMock).toHaveBeenCalledTimes(1)
		})
	})

	test('打开文档失败时应展示错误空状态', async () => {
		openDocumentMock.mockResolvedValueOnce({
			ok: false,
			error: createAppError({
				code: 'NOT_FOUND',
				message: '文档不存在',
				details: 'doc-editor-404',
				module: 'document-service',
				operation: 'openDocument',
			}),
		})

		renderWorkbenchPage(`${APP_ROUTES.WORKBENCH}?documentId=doc-editor-404`)

		expect(await screen.findByText('文档不存在')).toBeInTheDocument()
		expect(screen.getByText('doc-editor-404')).toBeInTheDocument()
	})
})
