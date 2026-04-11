// @vitest-environment jsdom

import { beforeEach, describe, expect, test } from 'vitest'
import {
	useWorkbenchStore,
	WORKBENCH_SIDE_PANEL_DEFAULT_WIDTH,
	WORKBENCH_SIDE_PANEL_MAX_WIDTH,
	WORKBENCH_SIDE_PANEL_MIN_WIDTH,
} from './workbench.store'

describe('workbench.store', () => {
	beforeEach(() => {
		window.localStorage.clear()
		useWorkbenchStore.getState().reset()
	})

	test('应从本地存储恢复侧栏宽度', () => {
		window.localStorage.setItem('stonedraw:workbench-side-panel-width', '360')

		useWorkbenchStore.getState().reset()

		expect(useWorkbenchStore.getState().sidePanelWidth).toBe(360)
	})

	test('设置侧栏宽度时应写入本地存储并限制范围', () => {
		useWorkbenchStore.getState().setSidePanelWidth(999)

		expect(useWorkbenchStore.getState().sidePanelWidth).toBe(WORKBENCH_SIDE_PANEL_MAX_WIDTH)
		expect(window.localStorage.getItem('stonedraw:workbench-side-panel-width')).toBe(String(WORKBENCH_SIDE_PANEL_MAX_WIDTH))

		useWorkbenchStore.getState().setSidePanelWidth(100)

		expect(useWorkbenchStore.getState().sidePanelWidth).toBe(WORKBENCH_SIDE_PANEL_MIN_WIDTH)
		expect(window.localStorage.getItem('stonedraw:workbench-side-panel-width')).toBe(String(WORKBENCH_SIDE_PANEL_MIN_WIDTH))
	})

	test('应可从本地存储重新回灌侧栏宽度，覆盖会话内旧值', () => {
		useWorkbenchStore.getState().setSidePanelWidth(240)
		window.localStorage.setItem('stonedraw:workbench-side-panel-width', '360')

		useWorkbenchStore.getState().rehydrateSidePanelWidth()

		expect(useWorkbenchStore.getState().sidePanelWidth).toBe(360)
	})

	test('折叠与展开侧栏时不应丢失最近一次有效宽度', () => {
		useWorkbenchStore.getState().setSidePanelWidth(320)
		useWorkbenchStore.getState().setSidePanelOpen(false)
		useWorkbenchStore.getState().setSidePanelOpen(true)

		expect(useWorkbenchStore.getState().sidePanelWidth).toBe(320)
		expect(window.localStorage.getItem('stonedraw:workbench-side-panel-width')).toBe('320')
	})

	test('未命中本地存储时应回退到默认宽度', () => {
		useWorkbenchStore.getState().reset()

		expect(useWorkbenchStore.getState().sidePanelWidth).toBe(WORKBENCH_SIDE_PANEL_DEFAULT_WIDTH)
	})
})
