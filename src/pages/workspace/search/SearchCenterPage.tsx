import { SearchIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'

function SearchCenterPage() {
	return (
		<div className='rounded-[1.75rem] border border-border/70 bg-card/78 p-6'>
			<h3 className='text-lg font-semibold tracking-tight'>SearchCenter 页面容器</h3>
			<p className='mt-3 text-sm leading-6 text-muted-foreground'>
				搜索中心现在是 Workspace 的真实一级页面，后续在这里承接跨文档、模板和素材搜索。
			</p>
			<div className='relative mt-5 max-w-2xl'>
				<SearchIcon className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
				<Input
					type='search'
					className='pl-9'
					placeholder='搜索中心占位：后续接入真实检索能力'
				/>
			</div>
		</div>
	)
}

export default SearchCenterPage
