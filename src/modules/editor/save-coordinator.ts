import type { AppState, BinaryFiles, ExcalidrawInitialDataState } from '@excalidraw/excalidraw/types'
import { createSceneFingerprint, serializeScene } from '@/adapters/excalidraw'
import { createFailureResult } from '@/services/tauri.service'
import { useEditorStore } from '@/stores/editor.store'
import type { DocumentMeta, SaveStatus, SceneFilePayload, TauriCommandResult } from '@/types'
import { saveActiveDocumentScene, type SaveSceneSuccessPayload } from './save'
import { readActiveScene } from './runtime'

const DEFAULT_AUTO_SAVE_DEBOUNCE_MS = 1000
const DEFAULT_WINDOW_CLOSE_FLUSH_TIMEOUT_MS = 2000

type SaveDocumentRef = Pick<DocumentMeta, 'id' | 'title'>

export type FlushBeforeLeaveOptions = {
	timeoutMs?: number
}

type SaveSessionUiState = {
	saveStatus: SaveStatus
	lastSaveError: string | null
	isFlushing: boolean
}

type SaveExecutionOutcome = {
	result: TauriCommandResult<SaveSceneSuccessPayload>
	stale: boolean
}

type SaveSessionState = SaveSessionUiState & {
	savedSceneFingerprint: string | null
	currentSceneFingerprint: string | null
	hasPendingCompensationSave: boolean
	scheduledTimer: ReturnType<typeof setTimeout> | null
	activeSavePromise: Promise<SaveExecutionOutcome> | null
	lifecycleToken: number
}

type SaveSessionDependencies = {
	debounceMs?: number
	readScene: (documentId: string, title?: string) => SceneFilePayload | null
	executeSave: (document: SaveDocumentRef) => Promise<TauriCommandResult<SaveSceneSuccessPayload>>
	writeUiState: (patch: Partial<SaveSessionUiState>) => void
}

export type EditorSaveSession = {
	initialize: (scene: SceneFilePayload) => void
	onSceneChange: (
		document: SaveDocumentRef,
		elements: NonNullable<ExcalidrawInitialDataState['elements']>,
		appState: AppState,
		files: BinaryFiles,
	) => SceneFilePayload
	saveNow: (document: SaveDocumentRef) => Promise<TauriCommandResult<SaveSceneSuccessPayload>>
	flushBeforeLeave: (document: SaveDocumentRef, options?: FlushBeforeLeaveOptions) => Promise<boolean>
	dispose: () => void
}

function createInitialSessionState(): SaveSessionState {
	return {
		saveStatus: 'idle',
		lastSaveError: null,
		isFlushing: false,
		savedSceneFingerprint: null,
		currentSceneFingerprint: null,
		hasPendingCompensationSave: false,
		scheduledTimer: null,
		activeSavePromise: null,
		lifecycleToken: 0,
	}
}

function writeStoreUiState(patch: Partial<SaveSessionUiState>) {
	const editorStore = useEditorStore.getState()

	if (patch.saveStatus !== undefined) {
		editorStore.setSaveStatus(patch.saveStatus)
	}

	if (patch.lastSaveError !== undefined) {
		editorStore.setLastSaveError(patch.lastSaveError)
	}

	if (patch.isFlushing !== undefined) {
		editorStore.setIsFlushing(patch.isFlushing)
	}
}

export function createEditorSaveSession(dependencies: SaveSessionDependencies): EditorSaveSession {
	const debounceMs = dependencies.debounceMs ?? DEFAULT_AUTO_SAVE_DEBOUNCE_MS
	const state = createInitialSessionState()

	function updateUiState(patch: Partial<SaveSessionUiState>) {
		if (patch.saveStatus !== undefined) {
			state.saveStatus = patch.saveStatus
		}

		if (patch.lastSaveError !== undefined) {
			state.lastSaveError = patch.lastSaveError
		}

		if (patch.isFlushing !== undefined) {
			state.isFlushing = patch.isFlushing
		}

		dependencies.writeUiState(patch)
	}

	function cancelScheduledSave() {
		if (!state.scheduledTimer) {
			return
		}

		clearTimeout(state.scheduledTimer)
		state.scheduledTimer = null
	}

	function createObservedScene(
		document: SaveDocumentRef,
		elements: NonNullable<ExcalidrawInitialDataState['elements']>,
		appState: AppState,
		files: BinaryFiles,
	) {
		return (
			dependencies.readScene(document.id, document.title)
			?? serializeScene(
				document.id,
				{
					elements,
					appState,
					files,
				},
				{ title: document.title },
			)
		)
	}

	function initialize(scene: SceneFilePayload) {
		cancelScheduledSave()
		state.lifecycleToken += 1
		state.savedSceneFingerprint = createSceneFingerprint(scene)
		state.currentSceneFingerprint = state.savedSceneFingerprint
		state.hasPendingCompensationSave = false
		state.activeSavePromise = null
		updateUiState({
			saveStatus: 'saved',
			lastSaveError: null,
			isFlushing: false,
		})
	}

	function scheduleAutoSave(document: SaveDocumentRef) {
		if (state.saveStatus === 'saved' || state.saveStatus === 'idle') {
			cancelScheduledSave()
			return
		}

		if (state.saveStatus === 'saving') {
			return
		}

		cancelScheduledSave()
		state.scheduledTimer = setTimeout(() => {
			state.scheduledTimer = null
			void runSaveLoop(document)
		}, debounceMs)
	}

	function onSceneChange(
		document: SaveDocumentRef,
		elements: NonNullable<ExcalidrawInitialDataState['elements']>,
		appState: AppState,
		files: BinaryFiles,
	) {
		const scene = createObservedScene(document, elements, appState, files)
		const nextFingerprint = createSceneFingerprint(scene)
		const hasUnsavedChanges = state.savedSceneFingerprint !== nextFingerprint
		const isSaving = state.saveStatus === 'saving'

		state.currentSceneFingerprint = nextFingerprint

		if (isSaving && hasUnsavedChanges) {
			state.hasPendingCompensationSave = true
		}

		updateUiState({
			saveStatus: hasUnsavedChanges ? (isSaving ? 'saving' : 'dirty') : 'saved',
			lastSaveError: null,
		})
		scheduleAutoSave(document)

		return scene
	}

	async function executeSaveOnce(document: SaveDocumentRef): Promise<SaveExecutionOutcome> {
		const lifecycleToken = state.lifecycleToken

		updateUiState({
			saveStatus: 'saving',
			lastSaveError: null,
		})

		const result = await dependencies.executeSave(document)

		if (lifecycleToken !== state.lifecycleToken) {
			return {
				result,
				stale: true,
			}
		}

		if (!result.ok) {
			updateUiState({
				saveStatus: 'error',
				lastSaveError: result.error.details ?? result.error.message,
			})

			return {
				result,
				stale: false,
			}
		}

		const savedFingerprint = createSceneFingerprint(result.data.scene)

		state.savedSceneFingerprint = savedFingerprint

		if (!state.currentSceneFingerprint) {
			state.currentSceneFingerprint = savedFingerprint
		}

		updateUiState({
			saveStatus: state.currentSceneFingerprint === savedFingerprint ? 'saved' : 'dirty',
			lastSaveError: null,
		})

		return {
			result,
			stale: false,
		}
	}

	async function runSaveLoop(
		document: SaveDocumentRef,
		options?: {
			forceInitialSave?: boolean
		},
	): Promise<TauriCommandResult<SaveSceneSuccessPayload>> {
		let latestResult: TauriCommandResult<SaveSceneSuccessPayload> | null = null
		let hasForcedInitialSave = false

		while (true) {
			if (state.activeSavePromise) {
				const activeSavePromise = state.activeSavePromise
				const activeSaveResult = await activeSavePromise

				if (state.activeSavePromise === activeSavePromise) {
					state.activeSavePromise = null
				}

				latestResult = activeSaveResult.result

				if (activeSaveResult.stale || !latestResult.ok) {
					return latestResult
				}

				continue
			}

			const shouldSave =
				(Boolean(options?.forceInitialSave) && !hasForcedInitialSave)
				|| state.saveStatus === 'dirty'
				|| state.saveStatus === 'error'
				|| state.hasPendingCompensationSave

			if (!shouldSave) {
				if (latestResult) {
					return latestResult
				}

				return createFailureResult({
					code: 'INVALID_ARGUMENT',
					message: '当前文档没有待保存内容',
					details: `documentId=${document.id}`,
				}) as TauriCommandResult<SaveSceneSuccessPayload>
			}

			state.hasPendingCompensationSave = false
			hasForcedInitialSave = true

			const savePromise = executeSaveOnce(document)
			state.activeSavePromise = savePromise

			const saveOutcome = await savePromise

			if (state.activeSavePromise === savePromise) {
				state.activeSavePromise = null
			}

			latestResult = saveOutcome.result

			if (saveOutcome.stale || !latestResult.ok) {
				return latestResult
			}
		}
	}

	async function saveNow(document: SaveDocumentRef) {
		cancelScheduledSave()

		return runSaveLoop(document, {
			forceInitialSave: true,
		})
	}

	async function flushBeforeLeave(document: SaveDocumentRef, options?: FlushBeforeLeaveOptions) {
		cancelScheduledSave()
		updateUiState({
			isFlushing: true,
		})

		try {
			if (state.saveStatus === 'saved' && !state.hasPendingCompensationSave) {
				return true
			}

			const flushPromise =
				state.saveStatus === 'saving' && state.activeSavePromise
					? state.activeSavePromise.then(async (activeSaveResult) => {
							if (activeSaveResult.stale || !activeSaveResult.result.ok) {
								return activeSaveResult.result
							}

							if (
								state.saveStatus === 'dirty'
								|| state.saveStatus === 'error'
								|| state.hasPendingCompensationSave
							) {
								return runSaveLoop(document)
							}

							return activeSaveResult.result
						})
					: runSaveLoop(document)

			const result =
				options?.timeoutMs === undefined
					? await flushPromise
					: await Promise.race([
							flushPromise,
							new Promise<TauriCommandResult<SaveSceneSuccessPayload>>((resolve) => {
								setTimeout(() => {
									resolve(
										createFailureResult({
											code: 'UNKNOWN_ERROR',
											message: '关闭窗口前保存超时',
											details: `documentId=${document.id}`,
										}) as TauriCommandResult<SaveSceneSuccessPayload>,
									)
								}, options.timeoutMs ?? DEFAULT_WINDOW_CLOSE_FLUSH_TIMEOUT_MS)
							}),
						])

			return result.ok
		} finally {
			updateUiState({
				isFlushing: false,
			})
		}
	}

	function dispose() {
		cancelScheduledSave()
		state.lifecycleToken += 1
		state.savedSceneFingerprint = null
		state.currentSceneFingerprint = null
		state.hasPendingCompensationSave = false
		state.activeSavePromise = null
		updateUiState({
			saveStatus: 'idle',
			lastSaveError: null,
			isFlushing: false,
		})
	}

	return {
		initialize,
		onSceneChange,
		saveNow,
		flushBeforeLeave,
		dispose,
	}
}

export const editorSaveSession = createEditorSaveSession({
	readScene: readActiveScene,
	executeSave: saveActiveDocumentScene,
	writeUiState: writeStoreUiState,
})
