export type DirectoryHealth = {
	path: string
	isReady: boolean
}

export type LocalDirectoriesPayload = {
	rootDir: DirectoryHealth
	dataDir: DirectoryHealth
	configDir: DirectoryHealth
}
