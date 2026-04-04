import { useEffect } from 'react'
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { OverlayRoot, WorkbenchLayout, WorkspaceLayout } from '@/app/layouts'
import { resolveSceneByPathname, APP_ROUTES } from '@/constants/routes'
import { useAppStore } from '@/stores/app.store'
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

function RouteStateSync() {
	const location = useLocation()
	const setActiveScene = useAppStore((state) => state.setActiveScene)

	useEffect(() => {
		const scene = resolveSceneByPathname(location.pathname)
		setActiveScene(scene.key, location.pathname)
	}, [location.pathname, setActiveScene])

	return null
}

function AppRouter() {
	return (
		<HashRouter>
			<RouteStateSync />
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
			<OverlayRoot />
		</HashRouter>
	)
}

export default AppRouter
