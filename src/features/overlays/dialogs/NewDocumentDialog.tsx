import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { buildWorkbenchRoute } from '@/shared/constants/routes'
import { documentService, useDocumentStore } from '@/features/documents'
import { useOverlayStore } from '../state'

function NewDocumentDialog() {
	const navigate = useNavigate()
	const activeOverlay = useOverlayStore((state) => state.activeOverlay)
	const closeOverlay = useOverlayStore((state) => state.closeOverlay)
	const setSelectedDocumentId = useDocumentStore((state) => state.setSelectedDocumentId)
	const syncWorkspaceCollections = useDocumentStore((state) => state.syncWorkspaceCollections)
	const [title, setTitle] = useState('未命名文档')
	const [isCreating, setIsCreating] = useState(false)
	const isOpen = activeOverlay === 'new-document'

	async function handleCreateDocument() {
		const normalizedTitle = title.trim() || '未命名文档'
		setIsCreating(true)
		const result = await documentService.createBlankDocument(normalizedTitle)
		setIsCreating(false)

		if (!result.ok) {
			toast.error(result.error.message)
			return
		}

		syncWorkspaceCollections(result.data.collections)
		setSelectedDocumentId(result.data.document.id)
		closeOverlay()
		navigate(buildWorkbenchRoute(result.data.document.id))
	}

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => {
				if (!open) {
					closeOverlay()
				}
			}}>
			<DialogContent className='sm:max-w-lg'>
				<DialogHeader>
					<DialogTitle>新建文档</DialogTitle>
					<DialogDescription>这里开始收口统一的新建入口，后续可继续扩展模板、来源和预设。</DialogDescription>
				</DialogHeader>
				<div className='grid gap-3'>
					<label className='grid gap-2'>
						<span className='text-sm font-medium'>文档标题</span>
						<Input
							value={title}
							onChange={(event) => {
								setTitle(event.target.value)
							}}
							placeholder='输入文档标题'
						/>
					</label>
				</div>
				<DialogFooter>
					<Button
						type='button'
						variant='outline'
						onClick={closeOverlay}>
						取消
					</Button>
					<Button
						type='button'
						disabled={isCreating}
						onClick={() => {
							void handleCreateDocument()
						}}>
						{isCreating ? '正在创建' : '创建并进入工作台'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

export default NewDocumentDialog
