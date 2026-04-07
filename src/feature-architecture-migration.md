# 当前前端正式架构

这份文档用于记录 `consolidate-feature-first-architecture` 收口后的正式目录真相源，后续新增代码默认以这里为准。

## 正式目录

- `src/app`
  - 只负责应用装配、路由、壳层、Provider 和应用级状态
- `src/features`
  - 唯一业务真相源，按业务域组织页面、状态、服务和 UI
- `src/incubating`
  - 只存放未来能力口子与实验性页面容器，不作为正式产品入口
- `src/editor`
  - 编辑器内核适配层，目前为 `excalidraw`
- `src/platform`
  - Tauri 命令桥、日志和平台运行时能力
- `src/shared`
  - 跨 feature 复用的组件、常量、工具和类型
- `src/test`
  - 测试基座、fixture、mock 和 helper

## Feature 归属

- `features/documents`
  - 文档元数据、文档集合、场景与版本仓储、文档服务、文档状态、工作区文档 UI
- `features/workspace`
  - 管理态页面编排与 Workspace 共享 UI
- `features/workbench`
  - 创作态页面、工作台面板、持久化编排、工作台状态和壳层 UI
- `features/overlays`
  - 统一 OverlayRoot、弹层状态和核心对话框聚合入口
- `features/settings`
  - 设置与开发诊断页面

## 孵化目录

以下能力当前只保留未来入口和页面容器，不再放在正式 `features` 主链中：

- `incubating/search`
  - 保留 SearchCenter 页面容器，后续再接真实检索、索引与结果面板
- `incubating/templates`
  - 保留模板与素材页面落点，后续再接资源分类、模板创建与卡片网格

## 当前只做结构收口的 Feature

以下能力已经有正式落点，但这次 change 只完成结构归位，不补完整业务闭环：

- `features/recovery`
  - 保留 Recovery overlay 落点，暂不补批量恢复、恢复草稿检测和版本恢复流程
- `features/collaboration`
  - 保留 Team 页面与 Share overlay 落点，暂不补成员、权限、共享链接和实时协作

这些目录的约束是：

- 可以继续完善正式入口、类型和边界
- 不允许把 `src/incubating` 里的能力重新挂回正式导航、正式路由或顶层 feature barrel
- 不允许为了“先跑起来”重新引入顶层 `services / repositories / stores / overlay / adapters / pages`
- 不允许用伪完整实现冒充正式能力

## 已删除的过渡结构

以下旧真相源已经从当前主链移除，不再作为长期目录存在：

- 顶层 `src/stores`
- 顶层 `src/services`
- 顶层 `src/repositories`
- 顶层 `src/overlay`
- 顶层 `src/adapters`
- 顶层 `src/pages`
- 顶层 `src/components` 中承载业务主职责的旧入口
- `workspaceStore` 与其他只做 legacy re-export 的 wrapper

## 当前仓库约束

- 新业务代码优先进入 owning feature，而不是回到横向目录
- `app` 只能消费 feature 的公开入口，不承载业务真相源
- `platform/tauri` 只负责命令调用、归一化和日志，不直接写 UI store
- Workbench 业务编排放在 `features/workbench`，编辑器内核适配放在 `editor/excalidraw`
- 架构边界以 `bun run check:architecture` 为准，违反边界时直接修目录与导入，不再加兼容层
