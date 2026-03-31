import { Link, Outlet, useLocation } from 'react-router-dom'
import { FolderKanbanIcon, LayoutTemplateIcon, Settings2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarSeparator,
	SidebarTrigger,
} from '@/components/ui/sidebar'
import { APP_ROUTES, MAIN_NAV_ITEMS, resolveSceneByPathname } from '@/constants/routes'
import { useDialogHost } from '@/components/feedback/DialogHost'

function WorkspaceLayout() {
	const location = useLocation()
	const currentScene = resolveSceneByPathname(location.pathname)
	const { openDialog } = useDialogHost()

	return (
		<SidebarProvider defaultOpen>
			<Sidebar
				collapsible='icon'
				variant='inset'>
				<SidebarHeader>
					<div className='rounded-2xl border border-sidebar-border/70 bg-sidebar-primary/8 p-3'>
						<div className='flex items-center gap-2 text-sm font-semibold text-sidebar-foreground'>
							<FolderKanbanIcon />
							<span>StoneDraw</span>
						</div>
						<p className='mt-2 text-xs leading-5 text-sidebar-foreground/70'>
							`0.1.5` 起开始以路由和布局承载工作区、设置页和后续文档流程。
						</p>
					</div>
				</SidebarHeader>

				<SidebarContent>
					<SidebarGroup>
						<SidebarGroupLabel>主场景</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{MAIN_NAV_ITEMS.map((item) => {
									const isActive = item.key === currentScene.key
									const Icon = item.icon

									return (
										<SidebarMenuItem key={item.key}>
											<SidebarMenuButton
												asChild
												isActive={isActive}
												tooltip={item.label}>
												<Link to={item.path}>
													{Icon ? <Icon /> : null}
													<span>{item.label}</span>
												</Link>
											</SidebarMenuButton>
										</SidebarMenuItem>
									)
								})}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>

					<SidebarSeparator />

					<SidebarGroup>
						<SidebarGroupLabel>快速动作</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								<SidebarMenuItem>
									<SidebarMenuButton
										type='button'
										onClick={() => {
											openDialog({
												title: '工作区入口说明',
												description: '从 0.2.4 开始，编辑器统一通过工作区内的新建或文档列表入口进入。',
												content: '这样可以保证工作区始终是文档入口主场景，并为后续最近打开、重命名、删除和恢复能力保留稳定位置。',
											})
										}}>
										<LayoutTemplateIcon />
										<span>查看工作区说明</span>
									</SidebarMenuButton>
								</SidebarMenuItem>
								<SidebarMenuItem>
									<SidebarMenuButton
										type='button'
										onClick={() => {
											openDialog({
												title: '应用壳说明',
												description: '这里是 0.1.5 的全局 Dialog 容器。',
												content: '后续文档详情、设置向导和轻量面板都会从这里统一挂载，避免每个页面各自维护弹窗实现。',
											})
										}}>
										<Settings2Icon />
										<span>查看布局说明</span>
									</SidebarMenuButton>
								</SidebarMenuItem>
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				</SidebarContent>

				<SidebarFooter>
					<div className='rounded-2xl border border-sidebar-border/70 bg-background/70 p-3 text-xs leading-5 text-sidebar-foreground/75'>
						<p className='font-medium text-sidebar-foreground'>当前场景</p>
						<p className='mt-1'>{currentScene.description}</p>
					</div>
				</SidebarFooter>
			</Sidebar>

			<SidebarInset className='overflow-hidden rounded-xl border border-border/70 bg-card/70 shadow-sm backdrop-blur'>
				<header className='flex flex-col gap-3 border-b border-border/70 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-5'>
					<div className='flex items-center gap-3'>
						<SidebarTrigger />
						<Separator
							orientation='vertical'
							className='hidden h-6 md:block'
						/>
						<div className='flex flex-col gap-1'>
							<h2 className='text-base font-semibold'>{currentScene.label}</h2>
							<p className='text-sm text-muted-foreground'>{currentScene.description}</p>
						</div>
					</div>

					<Button
						asChild
						size='sm'
						variant='outline'>
						<Link to={APP_ROUTES.SETTINGS}>查看设置</Link>
					</Button>
				</header>

				<div className='flex-1 overflow-auto p-4 md:p-5'>
					<Outlet />
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}

export default WorkspaceLayout
