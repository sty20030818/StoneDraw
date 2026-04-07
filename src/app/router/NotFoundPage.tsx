import { useNavigate } from 'react-router-dom'
import { CompassIcon } from 'lucide-react'
import EmptyState from '@/shared/components/EmptyState'
import { APP_ROUTES } from '@/shared/constants/routes'

function NotFoundPage() {
	const navigate = useNavigate()

	return (
		<EmptyState
			actionLabel='返回工作区'
			description='当前路由没有对应页面，应用会统一回落到这个兜底视图。'
			icon={CompassIcon}
			onAction={() => {
				navigate(APP_ROUTES.WORKSPACE)
			}}
			title='页面未找到'
		/>
	)
}

export default NotFoundPage
