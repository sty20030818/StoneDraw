import { render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

vi.mock('@/shared/components/AppToaster', () => ({
	default: () => <div>Toast 容器</div>,
}))

vi.mock('@/app/shell/AppWindowCloseBridge', () => ({
	default: () => null,
}))

describe('AppShell', () => {
	test('windows 壳层应只保留内容容器', async () => {
		const { default: AppShell } = await import('./AppShell')

		render(
			<AppShell>
				<div>内容区</div>
			</AppShell>,
		)

		expect(screen.getByTestId('app-shell-root')).toBeInTheDocument()
	})

	test('mac 壳层应只保留内容容器', async () => {
		const { default: AppShell } = await import('./AppShell')

		render(
			<AppShell>
				<div>内容区</div>
			</AppShell>,
		)

		expect(screen.getByTestId('app-shell-root')).toBeInTheDocument()
	})

	test('windows 壳层应保持直角容器', async () => {
		const { default: AppShell } = await import('./AppShell')

		render(
			<AppShell>
				<div>内容区</div>
			</AppShell>,
		)

		expect(screen.getByTestId('app-shell-root')).not.toHaveClass('rounded-[14px]')
	})
})
