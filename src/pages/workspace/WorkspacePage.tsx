import { Navigate } from 'react-router-dom'
import { APP_ROUTES } from '@/constants/routes'

function WorkspacePage() {
	return (
		<Navigate
			replace
			to={APP_ROUTES.WORKSPACE_HOME}
		/>
	)
}

export default WorkspacePage
