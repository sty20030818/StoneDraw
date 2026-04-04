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
					'rounded-[1.25rem] border px-4 py-3 text-left transition-colors',
					isActive
						? 'border-primary/35 bg-primary/10 text-foreground'
						: 'border-transparent bg-transparent text-muted-foreground hover:border-border/70 hover:bg-card/80 hover:text-foreground',
				].join(' ')
			}>
			<div className='text-sm font-medium'>{item.label}</div>
			<div className='mt-1 text-xs leading-5 text-muted-foreground'>{item.description}</div>
		</NavLink>
	)
}

export default WorkspaceNavItem
