import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { Button } from '@/shared/ui/button'
import PageSection from './PageSection'
import SectionHeader from './SectionHeader'
import WorkspacePageShell from './WorkspacePageShell'

describe('page-shell components', () => {
	test('WorkspacePageShell 应保留工具区与页面内容，但不再渲染页面头', () => {
		render(
			<WorkspacePageShell
				title='文档库'
				description='页面壳描述'
				actions={<Button type='button'>主动作</Button>}
				toolbar={<div>工具区内容</div>}>
				<div>页面内容</div>
			</WorkspacePageShell>,
		)

		expect(screen.getByTestId('workspace-page-shell')).toBeInTheDocument()
		expect(screen.getByText('工具区内容')).toBeInTheDocument()
		expect(screen.getByText('页面内容')).toBeInTheDocument()
		expect(screen.queryByText('文档库')).not.toBeInTheDocument()
		expect(screen.queryByText('页面壳描述')).not.toBeInTheDocument()
		expect(screen.queryByRole('button', { name: '主动作' })).not.toBeInTheDocument()
	})

	test('PageSection 与 SectionHeader 应渲染统一区块头', () => {
		render(
			<PageSection
				header={
					<SectionHeader
						title='区块标题'
						description='区块说明'
						actions={<span>区块动作</span>}
					/>
				}>
				<div>区块正文</div>
			</PageSection>,
		)

		expect(screen.getByTestId('page-section')).toBeInTheDocument()
		expect(screen.getByTestId('section-header')).toBeInTheDocument()
		expect(screen.getByText('区块标题')).toBeInTheDocument()
		expect(screen.getByText('区块说明')).toBeInTheDocument()
		expect(screen.getByText('区块动作')).toBeInTheDocument()
		expect(screen.getByText('区块正文')).toBeInTheDocument()
	})
})
