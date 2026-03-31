# StoneDraw

StoneDraw 是一个基于 Excalidraw 内核规划中的本地优先桌面白板应用。当前仓库已完成 `0.1.0` 的最小工程初始化：React 19、TypeScript 6、Vite 8 与 Tauri 2 的基础链路已经打通。

当前仓库从 `0.1.1` 开始固定使用 Bun + OXC 作为基础开发工具链。

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
