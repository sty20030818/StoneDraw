import { useEffect, useRef } from 'react'
import { Toaster, toast } from 'sonner'
import { useAppStore } from '@/app/state'

function AppToaster() {
	const lastError = useAppStore((state) => state.lastError)
	const clearLastError = useAppStore((state) => state.clearLastError)
	const lastToastKeyRef = useRef<string | null>(null)

	useEffect(() => {
		if (!lastError) {
			return
		}

		const toastKey = `${lastError.command ?? 'app'}:${lastError.code}:${lastError.message}`
		if (lastToastKeyRef.current === toastKey) {
			clearLastError()
			return
		}

		lastToastKeyRef.current = toastKey
		toast.error(lastError.message, {
			description: lastError.details ?? `命令：${lastError.command ?? 'unknown'}`,
			closeButton: true,
		})
		clearLastError()
	}, [clearLastError, lastError])

	return (
		<Toaster
			closeButton
			expand
			position='top-right'
			richColors
		/>
	)
}

export default AppToaster
