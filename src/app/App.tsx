import { useEffect } from 'react'
import { APP_BOOT_STAGES } from '@/constants'
import AppRouter from '@/app/AppRouter'
import AppToaster from '@/components/feedback/AppToaster'
import { DialogHostProvider } from '@/components/feedback/DialogHost'
import LoadingState from '@/components/states/LoadingState'
import { TooltipProvider } from '@/components/ui/tooltip'
import { systemService } from '@/services'
import { useAppStore } from '@/stores'

function App() {
	const bootStage = useAppStore((state) => state.bootStage)
	const isAppReady = useAppStore((state) => state.isAppReady)
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

	if (!isAppReady || bootStage !== APP_BOOT_STAGES.READY) {
		return (
			<div className='min-h-screen px-3 py-3 md:px-4 md:py-4'>
				<div className='mx-auto max-w-[1600px]'>
					<LoadingState
						description='先完成命令桥接自检，再进入工作区路由。'
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
