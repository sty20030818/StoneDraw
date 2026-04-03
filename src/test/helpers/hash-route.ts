export function setHashRoute(route: string) {
	window.location.hash = route.startsWith('#') ? route : `#${route}`
}

export function resetHashRoute() {
	window.location.hash = '#/'
}
