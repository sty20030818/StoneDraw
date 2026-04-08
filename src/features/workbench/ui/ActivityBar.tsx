import { Clock3Icon, FilesIcon } from 'lucide-react'
import { ActivityIcon } from '@/app/navigation'
import { WORKBENCH_ACTIVITY_ITEMS } from '@/app/router'
import type { WorkbenchPanelKey } from '@/features/workbench/state'

const panelIcons = {
	explorer: FilesIcon,
	history: Clock3Icon,
} satisfies Record<WorkbenchPanelKey, typeof FilesIcon>

type ActivityBarProps = {
	activePanel: WorkbenchPanelKey
	onPanelChange: (panel: WorkbenchPanelKey) => void
}

function ActivityBar({ activePanel, onPanelChange }: ActivityBarProps) {
	return (
		<aside className='flex h-full w-14 shrink-0 flex-col items-center gap-2 bg-card px-2 py-3'>
			<div
				data-tauri-drag-region
				className='h-8 w-full shrink-0 rounded-md'
			/>
			{WORKBENCH_ACTIVITY_ITEMS.map((item) => {
				const Icon = panelIcons[item.key]
				const isActive = item.key === activePanel

				return (
					<ActivityIcon
						key={item.key}
						icon={Icon}
						isActive={isActive}
						label={item.label}
						onClick={() => {
							onPanelChange(item.key)
						}}
					/>
				)
			})}
		</aside>
	)
}

export default ActivityBar
