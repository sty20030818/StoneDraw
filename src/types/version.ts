export type DocumentVersionKind = 'manual'

export type DocumentVersionMeta = {
	id: string
	documentId: string
	versionNumber: number
	versionKind: DocumentVersionKind
	label: string
	snapshotPath: string
	createdAt: number
	sourceUpdatedAt: number
}
