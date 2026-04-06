import type {
	AppState,
	BinaryFiles,
	ExcalidrawImperativeAPI,
	ExcalidrawInitialDataState,
} from '@excalidraw/excalidraw/types'
import { toTimestamp } from '@/utils'
import type { SceneEnvelopePayload, SceneFilePayload, SceneMetaPayload } from '@/types'

const CAPTURE_UPDATE_NEVER = 0 as unknown as Parameters<ExcalidrawImperativeAPI['updateScene']>[0]['captureUpdate']
const DEFAULT_SCHEMA_VERSION = 1
const DEFAULT_DOCUMENT_TITLE = '未命名文档'
const PERSISTED_APP_STATE_KEYS = ['gridModeEnabled', 'viewBackgroundColor', 'gridSize', 'gridStep'] as const
const DEFAULT_PERSISTED_APP_STATE = {
	gridModeEnabled: false,
	viewBackgroundColor: '#ffffff',
	gridSize: 20,
	gridStep: 5,
} satisfies Record<(typeof PERSISTED_APP_STATE_KEYS)[number], unknown>

export type ExcalidrawSceneSnapshot = {
	elements: NonNullable<ExcalidrawInitialDataState['elements']>
	appState: AppState
	files: BinaryFiles
}

type DeserializeSceneOptions = {
	expectedDocumentId?: string
	fallbackTitle?: string
}

export class SceneValidationError extends Error {
	override name = 'SceneValidationError'
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function sortValueRecursively(value: unknown): unknown {
	if (Array.isArray(value)) {
		return value.map(sortValueRecursively)
	}

	if (!isRecord(value)) {
		return value
	}

	return Object.keys(value)
		.sort()
		.reduce<Record<string, unknown>>((accumulator, key) => {
			accumulator[key] = sortValueRecursively(value[key])
			return accumulator
		}, {})
}

function createStableJson(value: unknown): string {
	return JSON.stringify(sortValueRecursively(value))
}

function assertSceneRecord(value: unknown, fieldName: string): Record<string, unknown> {
	if (!isRecord(value)) {
		throw new SceneValidationError(`${fieldName} 结构无效`)
	}

	return value
}

function normalizeSceneMeta(metaValue: unknown, fallbackTitle = DEFAULT_DOCUMENT_TITLE): SceneMetaPayload {
	const meta = isRecord(metaValue) ? metaValue : {}
	const rawTitle = typeof meta.title === 'string' ? meta.title.trim() : ''

	return {
		title: rawTitle || fallbackTitle,
		tags: Array.isArray(meta.tags) ? meta.tags.filter((tag): tag is string => typeof tag === 'string') : [],
		textIndex: typeof meta.textIndex === 'string' ? meta.textIndex : '',
	}
}

function normalizePersistedAppState(appStateValue: unknown): SceneEnvelopePayload['appState'] {
	if (appStateValue == null) {
		return {}
	}

	const appState = assertSceneRecord(appStateValue, 'scene.appState')
	const normalizedState: SceneEnvelopePayload['appState'] = {}

	for (const key of PERSISTED_APP_STATE_KEYS) {
		const candidateValue = appState[key]
		const defaultValue = DEFAULT_PERSISTED_APP_STATE[key]

		// 只持久化偏离 Excalidraw 默认值的字段，避免初始化阶段的默认运行态被误判成未保存。
		if (candidateValue !== undefined && candidateValue !== defaultValue) {
			normalizedState[key] = candidateValue
		}
	}

	return normalizedState
}

function normalizeFiles(filesValue: unknown): SceneEnvelopePayload['files'] {
	if (filesValue == null) {
		return {}
	}

	return assertSceneRecord(filesValue, 'scene.files')
}

function normalizeSceneEnvelope(sceneValue: unknown): SceneEnvelopePayload {
	const scene = assertSceneRecord(sceneValue, 'scene')

	if (!Array.isArray(scene.elements)) {
		throw new SceneValidationError('scene.elements 必须是数组')
	}

	return {
		elements: scene.elements,
		appState: normalizePersistedAppState(scene.appState),
		files: normalizeFiles(scene.files),
	}
}

function normalizeUpdatedAt(updatedAtValue: unknown): number {
	return typeof updatedAtValue === 'number' && Number.isFinite(updatedAtValue) ? updatedAtValue : toTimestamp()
}

export function createScenePayload(
	documentId: string,
	elements: NonNullable<ExcalidrawInitialDataState['elements']>,
	appState: AppState,
	files: BinaryFiles,
	title = DEFAULT_DOCUMENT_TITLE,
): SceneFilePayload {
	return {
		documentId,
		schemaVersion: DEFAULT_SCHEMA_VERSION,
		updatedAt: toTimestamp(),
		scene: {
			elements,
			appState: normalizePersistedAppState(appState),
			files: normalizeFiles(files),
		},
		meta: {
			title,
			tags: [],
			textIndex: '',
		},
	}
}

export function serializeScene(
	documentId: string,
	snapshot: ExcalidrawSceneSnapshot,
	options?: {
		title?: string
		updatedAt?: number
		tags?: string[]
		textIndex?: string
	},
): SceneFilePayload {
	const payload = createScenePayload(
		documentId,
		snapshot.elements,
		snapshot.appState,
		snapshot.files,
		options?.title,
	)

	return {
		...payload,
		updatedAt: options?.updatedAt ?? payload.updatedAt,
		meta: {
			title: options?.title ?? payload.meta.title,
			tags: options?.tags ?? payload.meta.tags,
			textIndex: options?.textIndex ?? payload.meta.textIndex,
		},
	}
}

export function deserializeScene(sceneValue: unknown, options?: DeserializeSceneOptions): SceneFilePayload {
	const scenePayload = assertSceneRecord(sceneValue, 'scene payload')
	const documentId = typeof scenePayload.documentId === 'string' ? scenePayload.documentId.trim() : ''

	if (!documentId) {
		throw new SceneValidationError('scene payload 缺少 documentId')
	}

	if (options?.expectedDocumentId && documentId !== options.expectedDocumentId) {
		throw new SceneValidationError(
			`scene payload 的 documentId 与当前文档不匹配: expected=${options.expectedDocumentId}, actual=${documentId}`,
		)
	}

	return {
		documentId,
		schemaVersion:
			typeof scenePayload.schemaVersion === 'number' && Number.isFinite(scenePayload.schemaVersion)
				? scenePayload.schemaVersion
				: DEFAULT_SCHEMA_VERSION,
		updatedAt: normalizeUpdatedAt(scenePayload.updatedAt),
		scene: normalizeSceneEnvelope(scenePayload.scene),
		meta: normalizeSceneMeta(scenePayload.meta, options?.fallbackTitle),
	}
}

export function createSceneFingerprint(scene: SceneFilePayload): string {
	return createStableJson({
		scene: scene.scene,
		meta: scene.meta,
	})
}

export function createInitialSceneData(scene: SceneFilePayload): ExcalidrawInitialDataState {
	const normalizedScene = deserializeScene(scene)

	return {
		elements: normalizedScene.scene.elements as ExcalidrawInitialDataState['elements'],
		appState: normalizedScene.scene.appState as ExcalidrawInitialDataState['appState'],
		files: normalizedScene.scene.files as BinaryFiles,
	}
}

export function readSceneFromApi(api: ExcalidrawImperativeAPI, documentId: string, title?: string): SceneFilePayload {
	return serializeScene(
		documentId,
		{
			elements: api.getSceneElements(),
			appState: api.getAppState(),
			files: api.getFiles(),
		},
		{ title },
	)
}

export function applySceneToApi(api: ExcalidrawImperativeAPI, scene: SceneFilePayload) {
	const normalizedScene = deserializeScene(scene)
	const files = Object.values(
		normalizedScene.scene.files,
	) as Parameters<ExcalidrawImperativeAPI['addFiles']>[0]

	// Excalidraw 0.18 的 updateScene 不再接受 files，需要通过 addFiles 单独补齐二进制资源。
	if (files.length > 0) {
		api.addFiles(files)
	}

	api.updateScene({
		elements: normalizedScene.scene.elements as Parameters<ExcalidrawImperativeAPI['updateScene']>[0]['elements'],
		appState: normalizedScene.scene.appState as Parameters<ExcalidrawImperativeAPI['updateScene']>[0]['appState'],
		captureUpdate: CAPTURE_UPDATE_NEVER,
	})
}
