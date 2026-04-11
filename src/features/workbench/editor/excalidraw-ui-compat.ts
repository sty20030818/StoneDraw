const EXCALIDRAW_WORKBENCH_HIDDEN_SELECTORS = [
	'.main-menu-trigger',
	'.default-sidebar-trigger',
	'.help-icon',
] as const

function hideWorkbenchIncompatibleUi(hostElement: HTMLElement) {
	hostElement
		.querySelectorAll<HTMLElement>(EXCALIDRAW_WORKBENCH_HIDDEN_SELECTORS.join(','))
		.forEach((element) => {
			element.style.setProperty('display', 'none', 'important')
		})
}

// Excalidraw 0.18.0 暂无完整 props 关闭这些入口，这里收敛为 host 内部兼容层。
function bindWorkbenchExcalidrawUiCompat(hostElement: HTMLElement) {
	hideWorkbenchIncompatibleUi(hostElement)

	const observer = new MutationObserver(() => {
		hideWorkbenchIncompatibleUi(hostElement)
	})

	observer.observe(hostElement, {
		childList: true,
		subtree: true,
		attributes: true,
	})

	return () => {
		observer.disconnect()
	}
}

export { bindWorkbenchExcalidrawUiCompat }
