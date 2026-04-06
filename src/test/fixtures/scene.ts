import { serializeScene } from '@/adapters/excalidraw'
import type { SceneFilePayload } from '@/shared/types'

type SceneFixtureOptions = {
	documentId?: string
	title?: string
	elements?: unknown[]
	appState?: Record<string, unknown>
	files?: Record<string, unknown>
}

export function createScenePayload(options: SceneFixtureOptions = {}): SceneFilePayload {
	const documentId = options.documentId ?? 'doc-test-1'
	const title = options.title ?? '测试文档'

	return serializeScene(
		documentId,
		{
			elements: (options.elements ?? []) as never,
			appState: (options.appState ?? {}) as never,
			files: (options.files ?? {}) as never,
		},
		{ title },
	)
}
