import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import EditorLayout from '@/components/layout/EditorLayout'
import WorkspaceLayout from '@/components/layout/WorkspaceLayout'
import { APP_ROUTES } from '@/constants/routes'
import { EditorPage, NotFoundPage, SettingsPage, WorkspacePage } from '@/pages'

function AppRouter() {
	return (
		<HashRouter>
			<Routes>
				<Route
					element={<AppLayout />}
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
					<Route element={<WorkspaceLayout />}>
						<Route
							element={<WorkspacePage />}
							path={APP_ROUTES.WORKSPACE}
						/>
						<Route
							element={<SettingsPage />}
							path={APP_ROUTES.SETTINGS}
						/>
					</Route>
					<Route element={<EditorLayout />}>
						<Route
							element={<EditorPage />}
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
