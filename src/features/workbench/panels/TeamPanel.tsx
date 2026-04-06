function TeamPanel() {
	return (
		<div className='grid gap-3'>
			<div className='rounded-[1.25rem] border border-border/70 bg-background/88 p-4'>
				<p className='text-sm font-medium'>Team</p>
				<p className='mt-2 text-xs leading-5 text-muted-foreground'>
					共享文档、成员协作和评论能力后续会从这里进入。
				</p>
			</div>
			<div className='rounded-[1.25rem] border border-dashed border-border/70 bg-background/70 p-4 text-sm leading-6 text-muted-foreground'>
				当前阶段只保留 Team 面板骨架，不提前实现协作业务逻辑。
			</div>
		</div>
	)
}

export default TeamPanel
