type StatusCardItem = {
	label: string
	value: string
}

type StatusCardProps = {
	badge: string
	title: string
	description: string
	items: StatusCardItem[]
}

function StatusCard({ badge, title, description, items }: StatusCardProps) {
	return (
		<section className='status-card'>
			<span className='status-badge'>{badge}</span>
			<h1>{title}</h1>
			<p>{description}</p>
			<dl className='status-grid'>
				{items.map((item) => (
					<div
						key={item.label}
						className='status-grid-item'>
						<dt>{item.label}</dt>
						<dd>{item.value}</dd>
					</div>
				))}
			</dl>
		</section>
	)
}

export default StatusCard
