import { useEffect, type ReactNode } from 'react'
import { RotateCcwIcon, TriangleAlertIcon } from 'lucide-react'
import AppRouter from '@/app/AppRouter'
import { runBootstrapRuntime } from '@/app/bootstrap'
import { WindowChrome } from '@/app/chrome'
import { AppShell } from '@/app/layouts'
import { APP_BOOT_STAGES } from '@/constants'
import EmptyState from '@/components/states/EmptyState'
import LoadingState from '@/components/states/LoadingState'
import { useAppStore } from '@/stores'

function App() {
	const bootStage = useAppStore((state) => state.bootStage)
	const isAppReady = useAppStore((state) => state.isAppReady)
	const bootstrapError = useAppStore((state) => state.bootstrapError)
	const setBootstrapFailure = useAppStore((state) => state.setBootstrapFailure)
	const setBootstrapReady = useAppStore((state) => state.setBootstrapReady)
	const setLocalDirectories = useAppStore((state) => state.setLocalDirectories)
	const setLocalDirectoryStatus = useAppStore((state) => state.setLocalDirectoryStatus)
	const setDatabaseHealth = useAppStore((state) => state.setDatabaseHealth)
	const setDatabaseStatus = useAppStore((state) => state.setDatabaseStatus)

	function renderShell(content: ReactNode, showWindowChrome = false) {
		return (
			<AppShell>
				{showWindowChrome ? <WindowChrome /> : null}
				{content}
			</AppShell>
		)
	}

	useEffect(() => {
		let isMounted = true

		async function bootstrapApp() {
			const runtimeResult = await runBootstrapRuntime()

			if (!isMounted) {
				return
			}

			if (!runtimeResult.ok) {
				if (runtimeResult.error.localDirectories) {
					setLocalDirectories(runtimeResult.error.localDirectories)
				} else {
					setLocalDirectoryStatus('error')
				}

				if (runtimeResult.error.databaseHealth) {
					setDatabaseHealth(runtimeResult.error.databaseHealth)
				} else {
					setDatabaseStatus('error')
				}

				setBootstrapFailure({
					error: runtimeResult.error.error,
					snapshot: runtimeResult.error.snapshot,
				})
				return
			}

			setLocalDirectories(runtimeResult.data.localDirectories)
			setDatabaseHealth(runtimeResult.data.databaseHealth)
			setBootstrapReady(runtimeResult.data.snapshot)
		}

		void bootstrapApp()

		return () => {
			isMounted = false
		}
	}, [setBootstrapFailure, setBootstrapReady, setDatabaseHealth, setDatabaseStatus, setLocalDirectories, setLocalDirectoryStatus])

	if (bootStage === APP_BOOT_STAGES.BOOTSTRAPPING) {
		return renderShell(
			<div className='flex min-h-0 flex-1'>
				<div className='flex min-h-0 flex-1 items-center justify-center p-6'>
					<LoadingState
						description='先准备本地目录，再初始化 SQLite 与 migration。'
						title='正在启动应用外壳'
					/>
				</div>
			</div>,
			true,
		)
	}

	if (bootStage === APP_BOOT_STAGES.FAILED) {
		return renderShell(
			<div className='flex min-h-0 flex-1 items-center justify-center p-6'>
					<EmptyState
						title='应用启动失败'
						description={bootstrapError?.message ?? '启动链路未能完成，请检查本地目录、数据库和日志输出。'}
						icon={TriangleAlertIcon}
						actionLabel='重新加载'
						onAction={() => {
							window.location.reload()
						}}
					/>
			</div>,
			true,
		)
	}

	if (!isAppReady || bootStage !== APP_BOOT_STAGES.READY) {
		return renderShell(
			<div className='flex min-h-0 flex-1 items-center justify-center p-6'>
					<EmptyState
						title='启动状态异常'
						description='应用未处于 bootstrapping、failed 或 ready 的有效状态，请重新启动应用。'
						icon={RotateCcwIcon}
						actionLabel='重新加载'
						onAction={() => {
							window.location.reload()
						}}
					/>
			</div>,
			true,
		)
	}

	return renderShell(
			<AppRouter />
	)
}

export default App
