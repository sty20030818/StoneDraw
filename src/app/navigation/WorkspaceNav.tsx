import { WORKSPACE_NAV_ITEMS } from '@/app/router'
import WorkspaceNavItem from './WorkspaceNavItem'

const navSections = [
	{
		label: '浏览',
		keys: ['home', 'documents'],
	},
	{
		label: '整理',
		keys: ['archive'],
	},
	{
		label: '系统',
		keys: ['settings'],
	},
] as const

function WorkspaceNav() {
	return (
		<nav className='flex flex-col gap-5'>
			{navSections.map((section) => (
				<div key={section.label}>
					<p className='px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground'>
						{section.label}
					</p>
					<div className='mt-2 grid gap-1'>
						{WORKSPACE_NAV_ITEMS.filter((item) => section.keys.some((key) => key === item.key)).map((item) => (
							<WorkspaceNavItem
								key={item.key}
								item={item}
							/>
						))}
					</div>
				</div>
			))}
		</nav>
	)
}

export default WorkspaceNav
