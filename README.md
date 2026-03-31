# StoneDraw

StoneDraw 是一个基于 Excalidraw 内核规划中的本地优先桌面白板应用。当前仓库已经完成：

- `0.1.0`：前端工程与 Tauri 桌面壳初始化
- `0.1.1`：Bun + OXC 基础开发工具链
- `0.1.2`：目录、状态管理与 service 骨架
- `0.1.3`：Tauri command 桥接与错误处理骨架
- `0.1.4`：Excalidraw 编辑器页面接入
- `0.1.5`：应用布局、路由与基础 UI 外壳

当前仓库从 `0.1.1` 开始固定使用 Bun + OXC 作为基础开发工具链。

当前仓库从 `0.1.5` 开始固定使用：

- `Tailwind CSS 4` 作为全局样式与设计 token 基线
- `shadcn/ui` 作为基础 UI 外壳来源，但当前只接入 Sidebar、Dialog、AlertDialog、Empty、Skeleton 等壳层能力
- `react-router-dom` 的 `HashRouter` 作为桌面场景下的基础路由实现

## 环境要求

- Bun 1.3+
- Rust stable
- Cargo
- Tauri 官方前置依赖

## 安装依赖

```bash
bun install
```

## 启动前端开发服务

```bash
bun dev
```

## 代码检查

```bash
bun check
```

## 代码格式化

```bash
bun format
```

## 类型检查

```bash
bun typecheck
```

## 兼容命令

```bash
bun lint
```

说明：

- `bun lint` 当前作为 `bun check` 的别名保留。
- `bun check` 与 `bun format` 均基于 OXC 工具链执行。

## 启动桌面开发模式

```bash
bun tauri dev
```

## 构建前端资源

```bash
bun run build
```

说明：

- Bun 的 `build` 是内置 bundler 命令，不会执行 `package.json` 中的 `build` script。
- 因此前端构建约定统一使用 `bun run build`。

## 构建桌面应用

```bash
bun tauri build
```

## 当前边界

- 当前已具备工作区、编辑器、设置占位页和 `not-found` 路由
- 当前已具备 Toast、Dialog、Confirm Dialog、Empty State、Loading State 的最小基础设施
- 当前尚未实现真实文档持久化、设置保存、复杂业务路由和完整设计系统
