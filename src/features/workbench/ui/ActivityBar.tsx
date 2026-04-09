import { Clock3Icon, FilesIcon, HomeIcon } from 'lucide-react'
import { ActivityIcon } from '@/app/navigation'
import { WORKBENCH_ACTIVITY_ITEMS } from '@/app/router'
import type { WorkbenchPanelKey } from '@/features/workbench/state'

const panelIcons = {
	explorer: FilesIcon,
	history: Clock3Icon,
} satisfies Record<WorkbenchPanelKey, typeof FilesIcon>

type ActivityBarProps = {
	activePanel: WorkbenchPanelKey
	onBack: () => void
	onPanelChange: (panel: WorkbenchPanelKey) => void
}

function ActivityBar({ activePanel, onBack, onPanelChange }: ActivityBarProps) {
	return (
		<aside className='flex h-full w-14 shrink-0 flex-col bg-card'>
			<div className='relative flex h-12 shrink-0 items-center justify-center px-2'>
				<ActivityIcon
					icon={HomeIcon}
					isActive={false}
					label='返回工作区'
					onClick={onBack}
				/>
			</div>
			<div className='flex flex-1 flex-col items-center gap-2 px-2 py-3'>
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
			</div>
		</aside>
	)
}

export default ActivityBar
