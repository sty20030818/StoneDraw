import { createFailureResult } from '@/services/tauri.service'
import { useEditorStore } from '@/stores'
import type { DocumentMeta, SaveStatus, TauriCommandResult } from '@/types'
import { saveActiveDocumentScene, type SaveSceneSuccessPayload } from './save'

const DEFAULT_AUTO_SAVE_DEBOUNCE_MS = 1000
const DEFAULT_FLUSH_TIMEOUT_MS = 2000

export type FlushReason = 'route-leave' | 'document-switch' | 'window-close' | 'app-exit'

type SaveDocumentRef = Pick<DocumentMeta, 'id' | 'title'>

type SaveCoordinatorRuntimeState = {
	saveStatus: SaveStatus
	hasScheduledSave: boolean
	hasPendingCompensationSave: boolean
	isFlushing: boolean
}

type SaveCoordinatorDependencies = {
	debounceMs?: number
	readRuntimeState: () => SaveCoordinatorRuntimeState
	writeRuntimeState: (patch: Partial<SaveCoordinatorRuntimeState>) => void
	executeSave: (document: SaveDocumentRef) => Promise<TauriCommandResult<SaveSceneSuccessPayload>>
}

function createStoreRuntimeState(): SaveCoordinatorRuntimeState {
	const editorStore = useEditorStore.getState()

	return {
		saveStatus: editorStore.saveStatus,
		hasScheduledSave: editorStore.hasScheduledSave,
		hasPendingCompensationSave: editorStore.hasPendingCompensationSave,
		isFlushing: editorStore.isFlushing,
	}
}

function updateStoreRuntimeState(patch: Partial<SaveCoordinatorRuntimeState>) {
	const editorStore = useEditorStore.getState()

	if (patch.saveStatus !== undefined) {
		editorStore.setSaveStatus(patch.saveStatus)
	}

	if (patch.hasScheduledSave !== undefined) {
		editorStore.setHasScheduledSave(patch.hasScheduledSave)
	}

	if (patch.hasPendingCompensationSave !== undefined) {
		editorStore.setHasPendingCompensationSave(patch.hasPendingCompensationSave)
	}

	if (patch.isFlushing !== undefined) {
		editorStore.setIsFlushing(patch.isFlushing)
	}
}

export function createSaveCoordinator(dependencies: SaveCoordinatorDependencies) {
	const debounceMs = dependencies.debounceMs ?? DEFAULT_AUTO_SAVE_DEBOUNCE_MS
	let scheduledTimer: ReturnType<typeof setTimeout> | null = null
	let activeSavePromise: Promise<TauriCommandResult<SaveSceneSuccessPayload>> | null = null

	function cancelScheduledSave() {
		if (scheduledTimer) {
			clearTimeout(scheduledTimer)
			scheduledTimer = null
		}

		dependencies.writeRuntimeState({
			hasScheduledSave: false,
		})
	}

	async function waitForActiveSave() {
		if (!activeSavePromise) {
			return null
		}

		return activeSavePromise
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
			const runtimeState = dependencies.readRuntimeState()

			if (activeSavePromise) {
				latestResult = await activeSavePromise
				activeSavePromise = null

				if (!latestResult.ok) {
					return latestResult
				}

				continue
			}

			const shouldSave =
				(Boolean(options?.forceInitialSave) && !hasForcedInitialSave)
				|| runtimeState.saveStatus === 'dirty'
				|| runtimeState.saveStatus === 'error'
				|| runtimeState.hasPendingCompensationSave

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

			dependencies.writeRuntimeState({
				hasPendingCompensationSave: false,
			})
			hasForcedInitialSave = true

			const savePromise = dependencies.executeSave(document)
			activeSavePromise = savePromise
			latestResult = await savePromise
			activeSavePromise = null

			if (!latestResult.ok) {
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

	function scheduleAutoSave(document: SaveDocumentRef) {
		const runtimeState = dependencies.readRuntimeState()

		if (runtimeState.saveStatus === 'saved' || runtimeState.saveStatus === 'idle') {
			cancelScheduledSave()
			return
		}

		if (runtimeState.saveStatus === 'saving') {
			return
		}

		cancelScheduledSave()
		dependencies.writeRuntimeState({
			hasScheduledSave: true,
		})

		scheduledTimer = setTimeout(() => {
			scheduledTimer = null
			dependencies.writeRuntimeState({
				hasScheduledSave: false,
			})
			void runSaveLoop(document)
		}, debounceMs)
	}

	async function flushPendingSave(document: SaveDocumentRef, reason: FlushReason) {
		cancelScheduledSave()
		dependencies.writeRuntimeState({
			isFlushing: true,
		})

		try {
			const runtimeState = dependencies.readRuntimeState()

			if (runtimeState.saveStatus === 'saved' && !runtimeState.hasPendingCompensationSave) {
				return true
			}

			const flushPromise =
				runtimeState.saveStatus === 'saving' && activeSavePromise
					? activeSavePromise.then(async (result) => {
							if (!result.ok) {
								return result
							}

							const nextRuntimeState = dependencies.readRuntimeState()

							if (
								nextRuntimeState.saveStatus === 'dirty'
								|| nextRuntimeState.saveStatus === 'error'
								|| nextRuntimeState.hasPendingCompensationSave
							) {
								return runSaveLoop(document)
							}

							return result
						})
					: runSaveLoop(document)

			const result =
				reason === 'window-close' || reason === 'app-exit'
					? await Promise.race([
							flushPromise,
							new Promise<TauriCommandResult<SaveSceneSuccessPayload>>((resolve) => {
								setTimeout(() => {
									resolve(
										createFailureResult({
											code: 'UNKNOWN_ERROR',
											message: '退出前保存超时',
											details: `documentId=${document.id}`,
										}) as TauriCommandResult<SaveSceneSuccessPayload>,
									)
								}, DEFAULT_FLUSH_TIMEOUT_MS)
							}),
						])
					: await flushPromise

			return result.ok
		} finally {
			dependencies.writeRuntimeState({
				isFlushing: false,
			})
		}
	}

	return {
		cancelScheduledSave,
		flushPendingSave,
		saveNow,
		scheduleAutoSave,
		waitForActiveSave,
	}
}

const defaultSaveCoordinator = createSaveCoordinator({
	readRuntimeState: createStoreRuntimeState,
	writeRuntimeState: updateStoreRuntimeState,
	executeSave: saveActiveDocumentScene,
})

export const cancelScheduledSave = defaultSaveCoordinator.cancelScheduledSave
export const flushPendingSave = defaultSaveCoordinator.flushPendingSave
export const saveNow = defaultSaveCoordinator.saveNow
export const scheduleAutoSave = defaultSaveCoordinator.scheduleAutoSave
export const waitForActiveSave = defaultSaveCoordinator.waitForActiveSave
