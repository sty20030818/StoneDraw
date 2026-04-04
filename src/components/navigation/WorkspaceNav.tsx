import { NavLink } from 'react-router-dom'
import { WORKSPACE_NAV_ITEMS } from '@/app/router'

function WorkspaceNav() {
	return (
		<nav className='mt-4 grid gap-2'>
			{WORKSPACE_NAV_ITEMS.map((item) => (
				<NavLink
					key={item.key}
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
			))}
		</nav>
	)
}

export default WorkspaceNav
