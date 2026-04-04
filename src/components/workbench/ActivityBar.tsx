import {
	BlocksIcon,
	Clock3Icon,
	FilesIcon,
	SearchIcon,
	UsersIcon,
} from 'lucide-react'
import { WORKBENCH_ACTIVITY_ITEMS } from '@/app/router'
import type { WorkbenchPanelKey } from '@/stores/workbench.store'
import ActivityIcon from '@/components/navigation/ActivityIcon'

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
		<aside className='flex w-18 shrink-0 flex-col items-center gap-3 border-r border-border/70 bg-card/78 px-3 py-4'>
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
