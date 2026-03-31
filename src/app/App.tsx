import { useEffect } from 'react'
import { APP_BOOT_STAGES } from '@/constants'
import { EditorPage } from '@/pages'
import { systemService } from '@/services'
import { useAppStore } from '@/stores'

function App() {
	const setAppReady = useAppStore((state) => state.setAppReady)
	const setBootStage = useAppStore((state) => state.setBootStage)

	useEffect(() => {
		let isMounted = true

		async function bootstrapApp() {
			await systemService.runDemo()

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

	return <EditorPage />
}

export default App
