import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const host = process.env.TAURI_DEV_HOST

export default defineConfig({
	plugins: [react(), tailwindcss()],
	clearScreen: false,
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
			'open-color': fileURLToPath(new URL('./node_modules/open-color/open-color.js', import.meta.url)),
		},
	},
	server: {
		port: 5173,
		strictPort: true,
		host: host || false,
		hmr: host
			? {
					protocol: 'ws',
					host,
					port: 1421,
				}
			: undefined,
		watch: {
			ignored: ['**/src-tauri/**'],
		},
	},
	envPrefix: ['VITE_', 'TAURI_ENV_*'],
	build: {
		target: process.env.TAURI_ENV_PLATFORM === 'windows' ? 'chrome105' : 'safari13',
		sourcemap: !!process.env.TAURI_ENV_DEBUG,
	},
})
