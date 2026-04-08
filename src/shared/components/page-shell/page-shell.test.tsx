import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { Button } from '@/shared/ui/button'
import PageSection from './PageSection'
import SectionHeader from './SectionHeader'
import WorkspacePageShell from './WorkspacePageShell'

describe('page-shell components', () => {
	test('WorkspacePageShell 应渲染标题、说明、动作与工具区', () => {
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
		expect(screen.getByText('文档库')).toBeInTheDocument()
		expect(screen.getByText('页面壳描述')).toBeInTheDocument()
		expect(screen.getByRole('button', { name: '主动作' })).toBeInTheDocument()
		expect(screen.getByText('工具区内容')).toBeInTheDocument()
		expect(screen.getByText('页面内容')).toBeInTheDocument()
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
