import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitest/config'

const alias = [
	{
		find: '@excalidraw/excalidraw/index.css',
		replacement: fileURLToPath(new URL('./src/test/mocks/excalidraw.css', import.meta.url)),
	},
	{
		find: '@excalidraw/excalidraw',
		replacement: fileURLToPath(new URL('./src/test/mocks/excalidraw.tsx', import.meta.url)),
	},
	{
		find: '@',
		replacement: fileURLToPath(new URL('./src', import.meta.url)),
	},
]

export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias,
	},
	test: {
		clearMocks: true,
		restoreMocks: true,
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html'],
			reportsDirectory: './coverage',
			include: ['src/**/*.{ts,tsx}'],
			exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**', 'src/main.tsx', 'src/vite-env.d.ts'],
		},
		projects: [
			{
				resolve: {
					alias,
				},
				test: {
					name: 'node',
					environment: 'node',
					include: ['src/**/*.test.ts'],
					exclude: ['src/**/*.test.tsx'],
					setupFiles: ['./src/test/setup.ts'],
				},
			},
			{
				resolve: {
					alias,
				},
				test: {
					name: 'jsdom',
					environment: 'jsdom',
					include: ['src/**/*.test.tsx'],
					setupFiles: ['./src/test/setup.ts', './src/test/setup-dom.ts'],
				},
			},
		],
	},
})
