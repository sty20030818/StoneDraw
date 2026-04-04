import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import {
	LegacyAppLayout,
	LegacyEditorLayout,
	LegacyWorkspaceLayout,
} from '@/components/layout'
import { APP_ROUTES } from '@/constants/routes'
import {
	LegacyEditorPage,
	LegacySettingsPage,
	LegacyWorkspacePage,
	NotFoundPage,
} from '@/pages'

function AppRouter() {
	return (
		<HashRouter>
			<Routes>
				<Route
					element={<LegacyAppLayout />}
					path={APP_ROUTES.ROOT}>
					<Route
						element={
							<Navigate
								replace
								to={APP_ROUTES.WORKSPACE}
							/>
						}
						index
					/>
					<Route element={<LegacyWorkspaceLayout />}>
						<Route
							element={<LegacyWorkspacePage />}
							path={APP_ROUTES.WORKSPACE}
						/>
						<Route
							element={<LegacySettingsPage />}
							path={APP_ROUTES.SETTINGS}
						/>
					</Route>
					<Route element={<LegacyEditorLayout />}>
						<Route
							element={<LegacyEditorPage />}
							path={APP_ROUTES.EDITOR}
						/>
					</Route>
					<Route
						element={<NotFoundPage />}
						path='*'
					/>
				</Route>
			</Routes>
		</HashRouter>
	)
}

export default AppRouter
