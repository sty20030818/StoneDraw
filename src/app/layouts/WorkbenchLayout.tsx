import { Outlet, useSearchParams } from 'react-router-dom'
import { WORKBENCH_ACTIVITY_ITEMS } from '@/app/router'

function WorkbenchLayout() {
	const [searchParams] = useSearchParams()
	const documentId = searchParams.get('documentId')

	return (
		<section className='flex h-full min-h-0 flex-1 overflow-hidden rounded-[1.75rem] border border-border/70 bg-background/82 shadow-sm backdrop-blur'>
			<aside className='flex w-18 shrink-0 flex-col items-center gap-3 border-r border-border/70 bg-card/78 px-3 py-4'>
				{WORKBENCH_ACTIVITY_ITEMS.map((item) => (
					<div
						key={item.key}
						className='flex h-12 w-12 items-center justify-center rounded-2xl border border-border/70 bg-background/85 text-[11px] font-medium text-muted-foreground'>
						{item.label.slice(0, 2)}
					</div>
				))}
			</aside>

			<aside className='flex w-72 shrink-0 flex-col border-r border-border/70 bg-card/72 p-4'>
				<p className='text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground'>Side Panel</p>
				<h2 className='mt-2 text-base font-semibold tracking-tight'>Workbench 上下文侧栏</h2>
				<div className='mt-4 grid gap-3'>
					{WORKBENCH_ACTIVITY_ITEMS.map((item) => (
						<div
							key={item.key}
							className='rounded-[1.25rem] border border-border/70 bg-background/88 px-4 py-3'>
							<div className='text-sm font-medium'>{item.label}</div>
							<div className='mt-1 text-xs leading-5 text-muted-foreground'>{item.description}</div>
						</div>
					))}
				</div>
			</aside>

			<div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
				<header className='flex shrink-0 items-center justify-between gap-4 border-b border-border/70 bg-background/86 px-5 py-4'>
					<div>
						<p className='text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground'>Workbench</p>
						<h2 className='mt-2 text-lg font-semibold tracking-tight'>Tabs / Title Bar 占位</h2>
					</div>
					<div className='rounded-full border border-border/70 bg-card/90 px-4 py-2 text-xs text-muted-foreground'>
						{documentId ? `文档上下文：${documentId}` : '等待文档上下文'}
					</div>
				</header>

				<div className='min-h-0 flex-1 overflow-auto bg-background/58 p-5'>
					<Outlet />
				</div>

				<footer className='flex shrink-0 items-center justify-between gap-3 border-t border-border/70 bg-card/74 px-5 py-3 text-xs text-muted-foreground'>
					<span>状态栏占位</span>
					<span>保存状态 / 缩放比例 / 协作状态预留</span>
				</footer>
			</div>

			<aside className='flex w-80 shrink-0 flex-col border-l border-border/70 bg-card/72 p-4'>
				<p className='text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground'>Right Panel</p>
				<h2 className='mt-2 text-base font-semibold tracking-tight'>右侧面板占位</h2>
				<div className='mt-4 rounded-[1.25rem] border border-border/70 bg-background/88 px-4 py-4 text-sm leading-6 text-muted-foreground'>
					当前阶段先固定右栏位置，后续再接入属性、评论和导出等能力。
				</div>
			</aside>
		</section>
	)
}

export default WorkbenchLayout
