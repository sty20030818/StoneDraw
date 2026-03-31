import { APP_FEATURE_SCOPE, APP_STATUS_BADGE, TECH_STACK_LABELS } from '@/constants'
import { StatusCard } from '@/components/status-card'
import { useAppStore, useEditorStore, useWorkspaceStore } from '@/stores'

function HomePage() {
	const bootStage = useAppStore((state) => state.bootStage)
	const isAppReady = useAppStore((state) => state.isAppReady)
	const commandBridgeStatus = useAppStore((state) => state.commandBridgeStatus)
	const lastCommandName = useAppStore((state) => state.lastCommandName)
	const lastError = useAppStore((state) => state.lastError)
	const currentView = useWorkspaceStore((state) => state.currentView)
	const saveStatus = useEditorStore((state) => state.saveStatus)

	return (
		<main className='app-shell'>
			<StatusCard
				badge={APP_STATUS_BADGE}
				title='应用骨架已就绪'
				description='StoneDraw 已从最小启动页过渡到可持续开发的前端骨架。'
				items={[
					{
						label: '应用状态',
						value: isAppReady ? `已就绪 · ${bootStage}` : '启动中',
					},
					{
						label: '当前视图',
						value: currentView,
					},
					{
						label: '保存状态',
						value: saveStatus,
					},
					{
						label: '命令桥接',
						value: lastCommandName ? `${commandBridgeStatus} · ${lastCommandName}` : commandBridgeStatus,
					},
					{
						label: '最近错误',
						value: lastError ? `${lastError.code} · ${lastError.message}` : '无',
					},
					{
						label: '技术基线',
						value: TECH_STACK_LABELS.join(' / '),
					},
					{
						label: '本版范围',
						value: APP_FEATURE_SCOPE.join(' / '),
					},
				]}
			/>
		</main>
	)
}

export default HomePage
