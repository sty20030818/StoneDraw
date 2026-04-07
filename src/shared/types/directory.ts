export type DirectoryHealth = {
	path: string
	isReady: boolean
}

export type LocalDirectoriesPayload = {
	rootDir: DirectoryHealth
	dataDir: DirectoryHealth
	documentsDir: DirectoryHealth
	logsDir: DirectoryHealth
	templatesDir: DirectoryHealth
	assetsDir: DirectoryHealth
	cacheDir: DirectoryHealth
}
