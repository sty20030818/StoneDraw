import { useEffect } from 'react'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { runBeforeWindowHideHandler } from './window-close-coordinator'

function AppWindowCloseBridge() {
	useEffect(() => {
		let isHandlingClose = false
		let unlistenCloseRequested: (() => void) | undefined

		void getCurrentWindow()
			.onCloseRequested(async (event) => {
				if (isHandlingClose) {
					return
				}

				event.preventDefault()
				isHandlingClose = true

				try {
					await runBeforeWindowHideHandler()
					await getCurrentWindow().hide()
				} catch {
					// 浏览器预览或缺少窗口权限时静默降级，不阻断普通页面开发。
				} finally {
					isHandlingClose = false
				}
			})
			.then((unlisten) => {
				unlistenCloseRequested = unlisten
			})
			.catch(() => {
				// 浏览器预览或缺少窗口权限时静默降级，不阻断普通页面开发。
			})

		return () => {
			unlistenCloseRequested?.()
		}
	}, [])

	return null
}

export default AppWindowCloseBridge
