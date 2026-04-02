import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { DialogHostProvider } from '@/components/feedback/DialogHost'

type RouteDefinition = {
	path: string
	element: ReactElement
}

type RenderRouteOptions = {
	initialEntry: string
	routes: RouteDefinition[]
}

export function renderRoute({ initialEntry, routes }: RenderRouteOptions) {
	return render(
		<DialogHostProvider>
			<MemoryRouter initialEntries={[initialEntry]}>
				<Routes>
					{routes.map((route) => (
						<Route
							key={route.path}
							element={route.element}
							path={route.path}
						/>
					))}
				</Routes>
			</MemoryRouter>
		</DialogHostProvider>,
	)
}
