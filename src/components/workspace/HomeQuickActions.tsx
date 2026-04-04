import { FilePlus2Icon, FolderOpenIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { DocumentMeta } from '@/types'

type HomeQuickActionsProps = {
	recentDocuments: DocumentMeta[]
	onCreate: () => void
	onContinue: () => void
}

function HomeQuickActions({ recentDocuments, onCreate, onContinue }: HomeQuickActionsProps) {
	return (
		<div className='mt-5 flex flex-wrap gap-3'>
			<Button
				type='button'
				onClick={onCreate}>
				<FilePlus2Icon data-icon='inline-start' />
				新建空白文档
			</Button>
			<Button
				type='button'
				variant='outline'
				disabled={recentDocuments.length === 0}
				onClick={onContinue}>
				<FolderOpenIcon data-icon='inline-start' />
				继续最近文档
			</Button>
		</div>
	)
}

export default HomeQuickActions
