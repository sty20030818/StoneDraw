import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import WorkbenchMetaRail from './WorkbenchMetaRail'
import WorkbenchShellFrame from './WorkbenchShellFrame'
import WorkbenchSidePanel from './WorkbenchSidePanel'

describe('workbench shell components', () => {
	test('WorkbenchSidePanel 应渲染标题、说明和面板内容', () => {
		render(
			<WorkbenchSidePanel
				label='资源'
				description='文档与上下文浏览'>
				<div>面板内容</div>
			</WorkbenchSidePanel>,
		)

		expect(screen.getByTestId('workbench-side-panel')).toBeInTheDocument()
		expect(screen.getByText('资源')).toBeInTheDocument()
		expect(screen.getByText('文档与上下文浏览')).toBeInTheDocument()
		expect(screen.getByText('面板内容')).toBeInTheDocument()
	})

	test('WorkbenchShellFrame 应渲染中央插槽与右侧 meta rail', () => {
		render(
			<WorkbenchShellFrame
				tabs={<div>标签栏</div>}
				titleBar={<div>标题栏</div>}
				canvas={<div>画布容器</div>}
				metaRail={<WorkbenchMetaRail title='Properties'>右栏内容</WorkbenchMetaRail>}
			/>,
		)

		expect(screen.getByTestId('workbench-shell-frame')).toBeInTheDocument()
		expect(screen.getByText('标签栏')).toBeInTheDocument()
		expect(screen.getByText('标题栏')).toBeInTheDocument()
		expect(screen.getByText('画布容器')).toBeInTheDocument()
		expect(screen.getByTestId('workbench-meta-rail')).toBeInTheDocument()
		expect(screen.getByText('右栏内容')).toBeInTheDocument()
	})
})
