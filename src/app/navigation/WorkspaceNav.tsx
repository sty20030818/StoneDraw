import { WORKSPACE_NAV_ITEMS } from '@/app/router'
import WorkspaceNavItem from './WorkspaceNavItem'

const navSections = [
	{
		label: '工作空间',
		keys: ['home', 'documents', 'templates', 'search'],
	},
	{
		label: '管理',
		keys: ['archive', 'team'],
	},
	{
		label: '系统',
		keys: ['settings'],
	},
] as const

function WorkspaceNav() {
	return (
		<nav className='mt-2 flex flex-col gap-4'>
			{navSections.map((section) => (
				<div key={section.label}>
					<p className='px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[#8a96ad]'>
						{section.label}
					</p>
					<div className='mt-2 grid gap-1.5'>
						{WORKSPACE_NAV_ITEMS.filter((item) => section.keys.includes(item.key)).map((item) => (
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
