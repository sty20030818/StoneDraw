import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'
import type { DocumentMeta } from '@/shared/types'
import DocumentListItem from './DocumentListItem'

const baseDocument: DocumentMeta = {
	id: 'doc-1',
	title: '文档一',
	createdAt: 1,
	updatedAt: 2,
	lastOpenedAt: 3,
	isDeleted: false,
	deletedAt: null,
	sourceType: 'local',
	saveStatus: 'saved',
}

describe('DocumentListItem', () => {
	test('点击行应打开文档', () => {
		const onOpen = vi.fn<(documentId: string) => void>()

		render(
			<DocumentListItem
				document={baseDocument}
				onOpen={onOpen}
				onRename={vi.fn<(documentId: string, title: string) => Promise<boolean>>()}
				onMoveToTrash={vi.fn<(document: DocumentMeta) => void>()}
			/>,
		)

		fireEvent.click(screen.getByText('文档一'))
		expect(onOpen).toHaveBeenCalledWith('doc-1')
	})

	test('更多操作应支持进入重命名', async () => {
		const user = userEvent.setup()

		render(
			<DocumentListItem
				document={baseDocument}
				onOpen={vi.fn<(documentId: string) => void>()}
				onRename={vi.fn<(documentId: string, title: string) => Promise<boolean>>().mockResolvedValue(true)}
				onMoveToTrash={vi.fn<(document: DocumentMeta) => void>()}
			/>,
		)

		await user.click(screen.getByTitle('更多操作'))
		await user.click(await screen.findByRole('menuitem', { name: '重命名' }))

		expect(screen.getByPlaceholderText('输入新的文档标题')).toBeInTheDocument()
	})

	test('删除到回收站动作应继续可用', async () => {
		const user = userEvent.setup()
		const onMoveToTrash = vi.fn<(document: DocumentMeta) => void>()

		render(
			<DocumentListItem
				document={baseDocument}
				onOpen={vi.fn<(documentId: string) => void>()}
				onRename={vi.fn<(documentId: string, title: string) => Promise<boolean>>()}
				onMoveToTrash={onMoveToTrash}
			/>,
		)

		await user.click(screen.getByTitle('更多操作'))
		await user.click(await screen.findByRole('menuitem', { name: '删除到回收站' }))

		await waitFor(() => {
			expect(onMoveToTrash).toHaveBeenCalledWith(baseDocument)
		})
	})
})
