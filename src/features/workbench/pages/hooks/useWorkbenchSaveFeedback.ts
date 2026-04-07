import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

export function useWorkbenchSaveFeedback(lastSaveError: string | null) {
	const latestSaveErrorRef = useRef<string | null>(null)

	useEffect(() => {
		if (!lastSaveError) {
			latestSaveErrorRef.current = null
			return
		}

		if (latestSaveErrorRef.current === lastSaveError) {
			return
		}

		latestSaveErrorRef.current = lastSaveError
		toast('自动保存失败', {
			description: lastSaveError,
		})
	}, [lastSaveError])
}
