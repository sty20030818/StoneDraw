import { WORKSPACE_NAV_ITEMS } from '@/app/router'
import WorkspaceNavItem from './WorkspaceNavItem'

function WorkspaceNav() {
	return (
		<nav className='mt-4 grid gap-2'>
			{WORKSPACE_NAV_ITEMS.map((item) => (
				<WorkspaceNavItem
					key={item.key}
					item={item}
				/>
			))}
		</nav>
	)
}

export default WorkspaceNav
