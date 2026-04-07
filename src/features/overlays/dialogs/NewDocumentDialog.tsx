import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { buildWorkbenchRoute } from '@/shared/constants/routes'
import { documentService, useDocumentStore } from '@/features/documents'
import { workspaceCollectionsService } from '@/features/workspace/services'
import { useWorkspaceStore } from '@/features/workspace/state'
import { useOverlayStore } from '../state'

function NewDocumentDialog() {
	const navigate = useNavigate()
	const activeDialog = useOverlayStore((state) => state.activeDialog)
	const closeDialog = useOverlayStore((state) => state.closeDialog)
	const setSelectedDocumentId = useDocumentStore((state) => state.setSelectedDocumentId)
	const syncWorkspaceCollections = useWorkspaceStore((state) => state.syncWorkspaceCollections)
	const [title, setTitle] = useState('未命名文档')
	const [isCreating, setIsCreating] = useState(false)
	const isOpen = activeDialog?.kind === 'new-document'

	useEffect(() => {
		if (!isOpen) {
			setTitle('未命名文档')
			return
		}

		setTitle(activeDialog.defaultTitle ?? '未命名文档')
	}, [activeDialog, isOpen])

	async function handleCreateDocument() {
		const normalizedTitle = title.trim() || '未命名文档'
		setIsCreating(true)
		const result = await documentService.createBlankDocument(normalizedTitle)
		setIsCreating(false)

		if (!result.ok) {
			toast.error(result.error.message)
			return
		}

		const collectionsResult = await workspaceCollectionsService.loadCollections()

		if (collectionsResult.ok) {
			syncWorkspaceCollections(collectionsResult.data)
		}

		setSelectedDocumentId(result.data.document.id)
		closeDialog()
		navigate(buildWorkbenchRoute(result.data.document.id))
	}

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => {
				if (!open) {
					closeDialog()
				}
			}}>
			<DialogContent className='sm:max-w-lg'>
				<DialogHeader>
					<DialogTitle>新建文档</DialogTitle>
					<DialogDescription>正式主链只保留一个新建入口，创建后直接进入工作台继续编辑。</DialogDescription>
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
						onClick={closeDialog}>
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
