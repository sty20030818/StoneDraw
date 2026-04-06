import type { LucideIcon } from 'lucide-react'

type ActivityIconProps = {
	icon: LucideIcon
	isActive: boolean
	label: string
	onClick: () => void
}

function ActivityIcon({ icon: Icon, isActive, label, onClick }: ActivityIconProps) {
	return (
		<button
			type='button'
			className={[
				'relative grid size-10 place-items-center rounded-[12px] border transition-colors',
				isActive
					? 'border-primary/15 bg-primary/10 text-primary'
					: 'border-transparent bg-transparent text-[#60708d] hover:bg-black/5 hover:text-foreground',
			].join(' ')}
			title={label}
			onClick={onClick}>
			{isActive ? <span className='absolute top-1/2 -left-3 h-5 w-[3px] -translate-y-1/2 rounded-full bg-primary' /> : null}
			<Icon />
		</button>
	)
}

export default ActivityIcon
