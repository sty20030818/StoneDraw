export type DocumentMeta = {
	id: string
	title: string
	fileName: string
	createdAt: string
	updatedAt: string
	lastOpenedAt: string | null
}

export type SceneFilePayload = {
	documentId: string
	version: number
	elements: readonly unknown[]
	appState: Record<string, unknown>
	files: Record<string, unknown>
	updatedAt: string
}
