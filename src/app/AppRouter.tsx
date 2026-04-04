import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { WorkbenchLayout, WorkspaceLayout } from '@/app/layouts'
import { APP_ROUTES } from '@/constants/routes'
import {
	ArchivePage,
	DocumentsPage,
	HomePage,
	NotFoundPage,
	SearchCenterPage,
	SettingsPage,
	TeamPage,
	TemplatesPage,
	WorkbenchPage,
} from '@/pages'

function AppRouter() {
	return (
		<HashRouter>
			<Routes>
				<Route
					element={
						<Navigate
							replace
							to={APP_ROUTES.WORKSPACE_HOME}
						/>
					}
					path={APP_ROUTES.ROOT}
				/>
				<Route
					element={<WorkspaceLayout />}
					path={APP_ROUTES.WORKSPACE}>
					<Route
						element={
							<Navigate
								replace
								to={APP_ROUTES.WORKSPACE_HOME}
							/>
						}
						index
					/>
					<Route
						element={<HomePage />}
						path='home'
					/>
					<Route
						element={<DocumentsPage />}
						path='documents'
					/>
					<Route
						element={<TemplatesPage />}
						path='templates'
					/>
					<Route
						element={<SearchCenterPage />}
						path='search'
					/>
					<Route
						element={<ArchivePage />}
						path='archive'
					/>
					<Route
						element={<TeamPage />}
						path='team'
					/>
					<Route
						element={<SettingsPage />}
						path='settings'
					/>
				</Route>
				<Route
					element={<WorkbenchLayout />}
					path={APP_ROUTES.WORKBENCH}>
					<Route
						element={<WorkbenchPage />}
						index
					/>
				</Route>
				<Route
					element={<NotFoundPage />}
					path='*'
				/>
			</Routes>
		</HashRouter>
	)
}

export default AppRouter
