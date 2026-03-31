import { useEffect } from 'react'
import { APP_BOOT_STAGES } from '@/constants'
import { HomePage } from '@/pages'
import { settingsService, systemService } from '@/services'
import { useAppStore } from '@/stores'

function App() {
	const setAppReady = useAppStore((state) => state.setAppReady)
	const setBootStage = useAppStore((state) => state.setBootStage)

	useEffect(() => {
		let isMounted = true

		async function bootstrapApp() {
			await systemService.runDemo()

			if (import.meta.env.DEV) {
				await settingsService.read()
			}

			if (!isMounted) {
				return
			}

			setBootStage(APP_BOOT_STAGES.READY)
			setAppReady(true)
		}

		void bootstrapApp()

		return () => {
			isMounted = false
		}
	}, [setAppReady, setBootStage])

	return <HomePage />
}

export default App
