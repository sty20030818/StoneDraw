import { useEffect } from 'react'
import { APP_BOOT_STAGES } from '@/constants'
import AppRouter from '@/app/AppRouter'
import AppToaster from '@/components/feedback/AppToaster'
import { DialogHostProvider } from '@/components/feedback/DialogHost'
import LoadingState from '@/components/states/LoadingState'
import { TooltipProvider } from '@/components/ui/tooltip'
import { databaseService, directoryService, systemService } from '@/services'
import { useAppStore } from '@/stores'

function App() {
	const bootStage = useAppStore((state) => state.bootStage)
	const isAppReady = useAppStore((state) => state.isAppReady)
	const setAppReady = useAppStore((state) => state.setAppReady)
	const setBootStage = useAppStore((state) => state.setBootStage)
	const setLocalDirectories = useAppStore((state) => state.setLocalDirectories)
	const setLocalDirectoryStatus = useAppStore((state) => state.setLocalDirectoryStatus)
	const setDatabaseHealth = useAppStore((state) => state.setDatabaseHealth)
	const setDatabaseStatus = useAppStore((state) => state.setDatabaseStatus)

	useEffect(() => {
		let isMounted = true

		async function bootstrapApp() {
			const localDirectoriesResult = await directoryService.prepareLocalDirectories()

			if (!isMounted) {
				return
			}

			if (localDirectoriesResult.ok) {
				setLocalDirectories(localDirectoriesResult.data)

				const databaseResult = await databaseService.initializeDatabase()

				if (!isMounted) {
					return
				}

				if (databaseResult.ok) {
					setDatabaseHealth(databaseResult.data)
					await systemService.runDemo()
				} else {
					setDatabaseStatus('error')
				}
			} else {
				setLocalDirectoryStatus('error')
				setDatabaseStatus('error')
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
	}, [setAppReady, setBootStage, setDatabaseHealth, setDatabaseStatus, setLocalDirectories, setLocalDirectoryStatus])

	if (!isAppReady || bootStage !== APP_BOOT_STAGES.READY) {
		return (
			<div className='h-screen overflow-hidden px-3 py-3 md:px-4 md:py-4'>
				<div className='mx-auto h-full max-w-400'>
					<LoadingState
						description='先准备本地目录，再初始化 SQLite 与 migration。'
						title='正在启动应用外壳'
					/>
				</div>
			</div>
		)
	}

	return (
		<TooltipProvider>
			<DialogHostProvider>
				<AppRouter />
				<AppToaster />
			</DialogHostProvider>
		</TooltipProvider>
	)
}

export default App
