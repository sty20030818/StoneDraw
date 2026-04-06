import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ActivityIconProps = {
	icon: LucideIcon
	isActive: boolean
	label: string
	onClick: () => void
}

function ActivityIcon({ icon: Icon, isActive, label, onClick }: ActivityIconProps) {
	return (
		<Button
			type='button'
			size='icon-lg'
			variant={isActive ? 'default' : 'outline'}
			className='rounded-2xl'
			title={label}
			onClick={onClick}>
			<Icon />
		</Button>
	)
}

export default ActivityIcon
