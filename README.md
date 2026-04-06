# StoneDraw

基于 **Excalidraw** 画布内核的 **本地优先** 桌面白板，技术栈为 **Tauri 2 + React + TypeScript**。本文件是仓库根目录的说明入口；**产品定义、信息架构与排期以 `Documents/` 下的 PRD 与总纲为准**（README 只做摘要，细节请务必读原文）。

---

## 项目简介

Excalidraw 强在编辑体验与嵌入能力，但官方更偏「编辑器内核」而非完整桌面产品：多文档管理、本地持久化、版本与恢复、搜索与资源库等需要宿主应用自行补齐。StoneDraw 的目标不是简单做一层桌面壳，而是做 **以 Excalidraw 为内核、可持续演进到同步与协作的桌面白板产品**。

**一句话定位（摘自产品文档）**：面向个人与小团队的、本地优先的 **可视化创作与知识整理工具**；第一阶段把「自己稳定好用」做扎实，再考虑跨设备一致与多人协作。

---

## 产品形态（总纲结论）

长期产品结构在文档中固定为：

**Workspace（工作区） + Workbench（工作台） + Collaboration Overlay（协作叠加层）**

- **Workspace**：文档、模板、素材、搜索、回收站、最近打开与项目组织。
- **Workbench**：进入文档后的创作环境（多文档、面板、版本、导出、属性等）。
- **Collaboration Overlay**：在不变更主骨架的前提下，逐步叠加同步、评论、分享与协作。

因此：启动入口面向工作区，编辑态是工作台，而不是「单文件壳」或纯管理器。

---

## 阶段与非目标（PRD 摘要）

- **第一阶段（个人版）**：稳定桌面体验、本地多文档、自动保存与崩溃恢复、版本历史与回滚、模板/资源库/搜索/导入导出等；架构上为同步与协作预留扩展点。
- **第一阶段明确不做**：多人实时协作、在线评论/审批流、公共分享链接、复杂权限与企业空间、重度 CRDT 合并、音视频会议等（详见 PRD）。

PRD 中的版本路线图（V0.1 → V2.2）按「小版本逐步交付」拆分；与 **本仓库当前代码里程碑**（见下文「当前实现进度」）对照时，以代码与本文「当前边界」为准。

---

## 技术栈

- **桌面**：Tauri 2、Rust（`src-tauri/`）
- **前端**：React 19、Vite 8、TypeScript
- **画布**：`@excalidraw/excalidraw`
- **工具链**：Bun、OXC（oxlint / oxfmt）
- **样式与组件**：Tailwind CSS 4、shadcn/ui（壳层能力按需接入）
- **路由**：`react-router-dom`（桌面场景使用 `HashRouter`）

---

## 仓库结构（速览）

| 路径 | 说明 |
| --- | --- |
| `src/app/` | 应用壳、路由、布局、启动编排与全局接线 |
| `src/features/` | 按业务领域组织的正式真相源，例如 `documents / workspace / workbench / settings / search` |
| `src/shared/` | 真正跨 feature 共享的 UI、hooks、constants、types、lib |
| `src/platform/` | 平台接入层，当前统一承接 Tauri command client 与 logging |
| `src/test/` | 测试辅助、fixtures、render helpers |
| `src-tauri/` | Rust 侧：窗口、命令、本地目录与数据库等 |
| `Documents/` | **产品与设计文档**（PRD、信息架构、线框、开发主线、任务拆解、历史原型） |

## 目录真相源与边界

- `src/app`：只负责应用级装配，不承载具体业务实现。
- `src/features`：业务功能的正式真相源。页面、服务、状态、面板、弹层优先收口到对应 feature。
- `src/shared`：只放跨 feature 可复用能力，不承载单一业务规则。
- `src/platform`：统一封装平台能力，避免业务层直接接触底层 bridge 与 logging 细节。
- `src/test`：测试基础设施与共享测试数据。

以下目录已进入 **legacy 冻结态**，仅允许保留兼容壳或历史过渡文件，不允许继续新增业务真相源：

- `src/pages`
- `src/services`
- `src/repositories`
- `src/stores`
- `src/workbench`
- `src/overlay`

以下目录已在本轮重构中删除，后续不得重新引入：

- `src/components/navigation`
- `src/components/workbench`
- `src/components/overlays`
- `src/pages/editor`
- `src/pages/settings`
- `src/domain`
- `src/modules`
- `src/services/local/local-storage.service.ts`
- `src/services/system.service.ts`

---

## 文档怎么读（`Documents/`）

建议顺序：

1. **`Documents/Excalidraw 本地化桌面应用 PRD.md`** — 背景、定位、用户、目标/非目标、原则与路线图总览。
2. **`Documents/StoneDraw V1-V3 产品形态与完整信息架构总纲.md`** — V1–V3 前的形态总纲与信息架构。
3. **`Documents/StoneDraw 导航与布局规范稿.md`**、`**Documents/StoneDraw 完整页面线框图原型文档.md`** — 导航、布局与页面级线框。
4. **`Documents/StoneDraw 从 0 到完成版开发文档.md`** — 开发主线、版本拆分与验收思路。
5. **`Documents/StoneDraw Phase 0 重构详细任务文档.md`** — Phase 0 可执行任务清单。
6. **`Documents/Excalidraw 能力复用与边界分析.md`**、**`Documents/Excalidraw V1 技术设计与开发拆解.md`**、**`Documents/Excalidraw V1 版本开发拆解.md`** — 内核边界与 V1 技术拆解。
7. **`Documents/Excalidraw 0.1.0-0.3.1 启动阶段任务拆解.md`** 等分阶段任务文 — 与仓库里程碑对照时以实际代码为准。
8. **`Documents/prototypes/`** — 历史原型（TSX/HTML），**仅供对照**，不等于当前实现。

---

## 环境要求

- Bun 1.3+
- Rust stable、Cargo
- Tauri 官方前置依赖（各平台编译环境）

---

## 安装依赖

```bash
bun install
```

---

## 常用命令

### 启动前端开发服务

```bash
bun dev
```

### 启动桌面开发模式

```bash
bun tauri dev
```

### 构建前端资源

```bash
bun run build
```

说明：Bun 的 `build` 是内置打包命令，不会执行 `package.json` 里的 `build` script，因此前端构建请使用 **`bun run build`**。

### 构建桌面应用

```bash
bun tauri build
```

### 代码质量

```bash
bun lint
bun run check
bun run check:architecture
bun format
bun run format:check
bun typecheck
```

说明：`bun lint`、`bun format` 与 `bun run format:check` 基于 OXC。`bun run check` 现在会串联 `lint + typecheck + 架构边界检查 + 前端测试`，其中 `bun run check:architecture` 会检查三类问题：已删除 legacy 目录是否重新出现源码、legacy 冻结目录是否偷偷新增文件、`app / features / shared / platform` 是否重新依赖已废弃入口。

### 测试

```bash
bun run test
bun run test:watch
bun run test:coverage
bun run test:rust
```

说明：前端测试为 Vitest，覆盖率输出在 `coverage/`；Rust 测试通过 `cargo test --manifest-path src-tauri/Cargo.toml`，由 `bun run test:rust` 包装。

---

## 当前实现进度（仓库里程碑）

已完成小版本（摘要）：

- `0.1.0`：前端工程与 Tauri 桌面壳初始化
- `0.1.1`：Bun + OXC 基础工具链
- `0.1.2`：目录、状态管理与 service 骨架
- `0.1.3`：Tauri command 桥接与错误处理骨架
- `0.1.4`：Excalidraw 编辑器页面接入
- `0.1.5`：应用布局、路由与基础 UI 外壳
- `0.2.0`：本地数据目录与配置目录初始化
- `0.2.1`：SQLite 与 Migration 机制接入

---

## 当前边界

- 已在启动阶段准备 `~/.stonedraw` 根目录，并通过 Tauri command 与前端 service 暴露目录状态。
- B 组当前默认真相源目录为：`~/.stonedraw/data/db/app.db`、`~/.stonedraw/data/documents/`、`~/.stonedraw/data/templates/`、`~/.stonedraw/data/assets/`、`~/.stonedraw/data/logs/`、`~/.stonedraw/data/cache/`。`exports/` 不再属于默认启动目录。
- 文档元数据存放在 `app.db`，当前正文固定落在 `~/.stonedraw/data/documents/<documentId>/current.scene.json`；数据库中的 `current_scene_path` 只保留为诊断字段，不再作为运行时路径真相源。
- `documents_open` 现在是正式生命周期动作，会准备 `current.scene`、执行缺失自愈，并更新 `recent_opens`；`documents_get_by_id` 仅承担查询。
- `recent_opens`、`workspace_states`、`workbench_sessions`、`document_search_index` 等 B 组基础表已进入 migration，服务后续连续性与上下文恢复扩展。
- 前后端 command 错误与日志事件已统一包含 `layer / module / operation / correlationId / objectId` 等字段，用于定位启动、目录、数据库、文档与保存链路。
- Workspace 的文档创建、打开、重命名、删除到回收站、恢复、永久删除与集合装载，现统一收口到 `DocumentService`；页面和 hook 只负责交互编排。
- 已具备工作区、编辑器、设置占位页与 `not-found` 路由；具备 Toast、Dialog、确认框、空态与加载态等最小基础设施。
- **尚未实现**：Version / Recovery / Template / Asset / Search 的完整业务闭环、设置持久化落地、以及多窗口/多工作区上下文恢复细节。
