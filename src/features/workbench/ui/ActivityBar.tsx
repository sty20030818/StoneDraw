import {
	BlocksIcon,
	Clock3Icon,
	FilesIcon,
	SearchIcon,
	UsersIcon,
} from 'lucide-react'
import { ActivityIcon } from '@/app/navigation'
import { WORKBENCH_ACTIVITY_ITEMS } from '@/app/router'
import type { WorkbenchPanelKey } from '@/features/workbench/state'

const panelIcons = {
	explorer: FilesIcon,
	search: SearchIcon,
	library: BlocksIcon,
	history: Clock3Icon,
	team: UsersIcon,
} satisfies Record<WorkbenchPanelKey, typeof FilesIcon>

type ActivityBarProps = {
	activePanel: WorkbenchPanelKey
	onPanelChange: (panel: WorkbenchPanelKey) => void
}

function ActivityBar({ activePanel, onPanelChange }: ActivityBarProps) {
	return (
		<aside className='flex h-full w-full shrink-0 flex-col items-center gap-2 border-r border-border/60 bg-[rgba(246,248,252,0.92)] px-2 py-3'>
			<div
				data-tauri-drag-region
				className='h-8 w-full shrink-0 rounded-[12px]'
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
