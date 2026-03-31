import type { SaveStatus } from './app'

export type DocumentSourceType = 'local'

export type DocumentMeta = {
	id: string
	title: string
	currentScenePath: string
	createdAt: number
	updatedAt: number
	lastOpenedAt: number | null
	isDeleted: boolean
	deletedAt: number | null
	sourceType: DocumentSourceType
	saveStatus: SaveStatus | 'error'
}

export type SceneEnvelopePayload = {
	elements: readonly unknown[]
	appState: Record<string, unknown>
	files: Record<string, unknown>
}

export type SceneMetaPayload = {
	title: string
	tags: string[]
	textIndex: string
}

export type SceneFilePayload = {
	documentId: string
	schemaVersion: number
	updatedAt: number
	scene: SceneEnvelopePayload
	meta: SceneMetaPayload
}
