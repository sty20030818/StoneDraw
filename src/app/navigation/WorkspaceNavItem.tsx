import { NavLink } from 'react-router-dom'
import type { WorkspaceNavItem as WorkspaceNavConfig } from '@/app/router/routes'

type WorkspaceNavItemProps = {
	item: WorkspaceNavConfig
}

function WorkspaceNavItem({ item }: WorkspaceNavItemProps) {
	const Icon = item.icon

	return (
		<NavLink
			to={item.path}
			className={({ isActive }) =>
				[
					'flex items-center gap-3 rounded-lg border px-2.5 py-2 text-left transition-colors',
					isActive
						? 'border-primary/15 bg-primary/12 text-primary shadow-sm'
						: 'border-transparent bg-transparent text-foreground/72 hover:border-primary/10 hover:bg-primary/6 hover:text-foreground',
				].join(' ')
			}>
			<span
				className={[
					'grid size-8 shrink-0 place-items-center rounded-md border transition-colors',
					'border-current/10 bg-background/80',
				].join(' ')}>
				<Icon className='size-4' />
			</span>
			<div className='min-w-0 text-sm font-medium'>{item.label}</div>
		</NavLink>
	)
}

export default WorkspaceNavItem
