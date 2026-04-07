# StoneDraw

StoneDraw 是一个基于 `Tauri 2 + React + TypeScript + Excalidraw` 的本地优先桌面白板。

当前仓库已经收口到可维护的 V1 主干：

- `Workspace`
  - `Home / Documents / Archive / Settings`
- `Workbench`
  - 文档打开、编辑、自动保存、离开前 flush、版本创建

## 文档真相源

仓库文档唯一真相源目录是 [`docs/`](./docs)。

建议优先阅读：

1. [`docs/StoneDraw V1-V3 文档体系总说明（中文版）.md`](./docs/StoneDraw%20V1-V3%20%E6%96%87%E6%A1%A3%E4%BD%93%E7%B3%BB%E6%80%BB%E8%AF%B4%E6%98%8E%EF%BC%88%E4%B8%AD%E6%96%87%E7%89%88%EF%BC%89.md)
2. `docs/00-总览与治理/`
3. `docs/02-产品结构层/`
4. `docs/04-技术架构层/`
5. [`docs/07-重构迁移层/92-当前前端正式架构.md`](./docs/07-%E9%87%8D%E6%9E%84%E8%BF%81%E7%A7%BB%E5%B1%82/92-%E5%BD%93%E5%89%8D%E5%89%8D%E7%AB%AF%E6%AD%A3%E5%BC%8F%E6%9E%B6%E6%9E%84.md)

## 当前边界

- 正式运行时只保留 `workspace/home`、`workspace/documents`、`workspace/archive`、`workspace/settings`、`workbench`
- `src/incubating` 只作为草图区存在，不接入正式路由和正式导航
- 全局弹窗只保留一套统一 overlay 机制
- `documents` 只负责文档领域
- `workspace` 负责 collections 查询与页面读模型
- `workbench` 只负责编辑态与保存编排
- Tauri command 面默认保持稳定，Rust 内部逐步收口到 `application + storage`

## 仓库结构

- `src/app`
  - 应用壳、路由、布局、Provider
- `src/features`
  - 正式业务真相源
- `src/incubating`
  - 非正式原型与未来能力草图
- `src/editor`
  - 编辑器适配层
- `src/platform`
  - 平台 bridge 与日志
- `src/shared`
  - 共享 UI、类型、工具
- `src-tauri`
  - Rust / Tauri 代码
- `docs`
  - 产品、架构与迁移文档

## 开发命令

```bash
bun install
bun run build
bun run typecheck
bun run test
bun run check:architecture
bun run test:rust
```

前端开发服务和桌面开发模式按本地工作流自行启动；仓库边界约束以 `bun run check:architecture` 为准。
