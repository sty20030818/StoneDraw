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
					'rounded-[14px] border px-4 py-3 text-left transition-all',
					isActive
						? 'border-transparent bg-[linear-gradient(135deg,#121b2e,#1e4dff)] text-white shadow-[0_14px_28px_rgba(27,77,255,0.18)]'
						: 'border-transparent bg-transparent text-[#50607b] hover:border-border/60 hover:bg-white/75 hover:text-foreground',
				].join(' ')
			}>
			<div className='text-sm font-semibold'>{item.label}</div>
			<div className='mt-1 text-xs leading-5 text-current/70'>{item.description}</div>
		</NavLink>
	)
}

export default WorkspaceNavItem
