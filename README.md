# StoneDraw

StoneDraw 是一个基于 Excalidraw 内核规划中的本地优先桌面白板应用。当前仓库已经完成：

- `0.1.0`：前端工程与 Tauri 桌面壳初始化
- `0.1.1`：Bun + OXC 基础开发工具链
- `0.1.2`：目录、状态管理与 service 骨架
- `0.1.3`：Tauri command 桥接与错误处理骨架
- `0.1.4`：Excalidraw 编辑器页面接入
- `0.1.5`：应用布局、路由与基础 UI 外壳
- `0.2.0`：本地数据目录与配置目录初始化
- `0.2.1`：SQLite 与 Migration 机制接入

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
bun lint
```

## 一键检查

```bash
bun run check
```

## 代码格式化

```bash
bun format
```

## 检查格式化结果

```bash
bun run format:check
```

## 类型检查

```bash
bun typecheck
```

## 运行前端测试

```bash
bun run test
```

## 监听前端测试

```bash
bun run test:watch
```

## 生成前端覆盖率

```bash
bun run test:coverage
```

## 运行 Rust 测试

```bash
bun run test:rust
```

说明：

- `bun lint`、`bun format` 与 `bun run format:check` 均基于 OXC 工具链执行。
- 前端测试统一使用 `Vitest`，覆盖率输出位于 `coverage/`。
- Rust 测试统一通过 `cargo test --manifest-path src-tauri/Cargo.toml` 执行，并由 `bun run test:rust` 包装调用。

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

- 当前已在启动阶段准备 `~/.stonedraw` 根目录，并通过 Tauri command + frontend service 暴露目录状态
- 当前约定 `~/.stonedraw/data` 承载后续 SQLite、文档文件、资源文件和快照等业务数据根路径
- 当前约定 `~/.stonedraw/config` 承载后续用户偏好与轻量配置文件根路径
- 当前已接入 `~/.stonedraw/data/db/stonedraw.sqlite` 元数据数据库，并在启动时顺序执行 migration
- 当前 SQLite 只负责元数据、配置与 migration 边界，不承载 Excalidraw scene 大对象
- 当前已具备工作区、编辑器、设置占位页和 `not-found` 路由
- 当前已具备 Toast、Dialog、Confirm Dialog、Empty State、Loading State 的最小基础设施
- 当前尚未实现真实文档持久化、设置保存、资源文件读写和复杂业务表设计
