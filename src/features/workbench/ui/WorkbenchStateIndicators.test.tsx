import { render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import StatusBar from './StatusBar'
import WorkbenchTabs from './WorkbenchTabs'

describe('Workbench 状态表现', () => {
	test('未保存时当前标签应展示提示标识', () => {
		render(
			<WorkbenchTabs
				tabs={[{ id: 'doc-1', title: '文档一' }]}
				activeTabId='doc-1'
				fallbackDocumentId='doc-1'
				fallbackDocumentTitle='文档一'
				isDocumentReady
				activeSaveStatus='dirty'
				onSelectTab={vi.fn<(documentId: string) => void>()}
				onCloseTab={vi.fn<(documentId: string) => void>()}
			/>,
		)

		expect(screen.getByTitle('未保存变更')).toBeInTheDocument()
		expect(screen.getByTitle('关闭标签')).toBeInTheDocument()
	})

	test('状态栏只显示关键状态，不再显示文档标识', () => {
		render(
			<StatusBar
				activePanel='explorer'
				isDocumentReady
				isRightPanelOpen={false}
				saveStatus='saved'
			/>,
		)

		expect(screen.getByText('面板：explorer')).toBeInTheDocument()
		expect(screen.getByText('保存：已保存')).toBeInTheDocument()
		expect(screen.queryByText(/doc-/)).not.toBeInTheDocument()
	})
})
