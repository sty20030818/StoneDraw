import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Tabs as TabsPrimitive } from 'radix-ui'
import { cn } from '@/shared/lib/utils'

const tabsListVariants = cva(
	'inline-flex items-center rounded-[1rem] border border-border/80 bg-muted/40 p-1 text-muted-foreground shadow-sm',
	{
		variants: {
			variant: {
				default: '',
				ghost: 'bg-card',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	},
)

function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
	return (
		<TabsPrimitive.Root
			data-slot='tabs'
			className={cn('flex flex-col gap-3', className)}
			{...props}
		/>
	)
}

function TabsList({
	className,
	variant,
	...props
}: React.ComponentProps<typeof TabsPrimitive.List> & VariantProps<typeof tabsListVariants>) {
	return (
		<TabsPrimitive.List
			data-slot='tabs-list'
			className={cn(tabsListVariants({ variant }), className)}
			{...props}
		/>
	)
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
	return (
		<TabsPrimitive.Trigger
			data-slot='tabs-trigger'
			className={cn(
				'inline-flex items-center justify-center gap-1.5 rounded-[0.8rem] px-4 py-2.5 text-sm font-medium whitespace-nowrap text-muted-foreground outline-none transition-all data-[state=active]:border data-[state=active]:border-border/90 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm disabled:pointer-events-none disabled:opacity-50',
				className,
			)}
			{...props}
		/>
	)
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
	return (
		<TabsPrimitive.Content
			data-slot='tabs-content'
			className={cn('outline-none', className)}
			{...props}
		/>
	)
}

export { Tabs, TabsContent, TabsList, TabsTrigger }
