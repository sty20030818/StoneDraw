import { useEffect } from 'react'
import { APP_BOOT_STAGES } from '@/constants'
import { HomePage } from '@/pages'
import { useAppStore } from '@/stores'

function App() {
	const setAppReady = useAppStore((state) => state.setAppReady)
	const setBootStage = useAppStore((state) => state.setBootStage)

	useEffect(() => {
		setBootStage(APP_BOOT_STAGES.READY)
		setAppReady(true)
	}, [setAppReady, setBootStage])

	return <HomePage />
}

export default App
