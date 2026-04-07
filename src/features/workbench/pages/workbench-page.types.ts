import type { DocumentMeta, SceneFilePayload } from '@/shared/types'

export type WorkbenchLoadState =
	| {
			status: 'loading'
	  }
	| {
			status: 'error'
			title: string
			description: string
	  }
	| {
			status: 'ready'
			document: DocumentMeta
			scene: SceneFilePayload
	  }
