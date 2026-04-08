import { NavLink } from 'react-router-dom'
import type { WorkspaceNavItem as WorkspaceNavConfig } from '@/app/router/routes'

type WorkspaceNavItemProps = {
	item: WorkspaceNavConfig
}

function WorkspaceNavItem({ item }: WorkspaceNavItemProps) {
	return (
		<NavLink
			to={item.path}
			className={({ isActive }) =>
				[
					'rounded-lg border px-4 py-3 text-left transition-colors',
					isActive
						? 'border-border bg-accent text-foreground'
						: 'border-transparent text-muted-foreground hover:border-border hover:bg-muted/50 hover:text-foreground',
				].join(' ')
			}>
			<div className='text-sm font-semibold'>{item.label}</div>
			<div className='mt-1 text-xs leading-5 text-current/70'>{item.description}</div>
		</NavLink>
	)
}

export default WorkspaceNavItem
