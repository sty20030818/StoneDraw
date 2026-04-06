# Feature 架构迁移分区

这份文档是 `restructure-src-feature-architecture` change 的第一阶段真相源，用来明确当前 `src/` 中哪些对象保留、哪些迁移、哪些待删、哪些冻结。

## 正式目标目录

- `app`
- `features`
- `shared`
- `platform`
- `test`

后续所有新代码默认只允许进入以上正式结构。

## 保留区

以下目录当前仍然是正式真相源，后续重构时以“迁移引用、保持行为”为主，不直接推翻：

- `src/app`
- `src/test`
- `src/styles.css`
- `src/main.tsx`

## 迁移区

以下目录中存在真实业务能力，但后续必须迁入 `features`、`shared` 或 `platform`：

- `src/adapters`
- `src/components/feedback`
- `src/components/panels`
- `src/components/states`
- `src/components/ui`
- `src/components/workspace`
- `src/constants`
- `src/hooks`
- `src/infra`
- `src/lib`
- `src/overlay`
- `src/pages`
- `src/repositories`
- `src/services`
- `src/stores`
- `src/types`
- `src/utils`
- `src/workbench`

## 待删区

以下目录或文件在新结构接线完成后应直接删除，不保留长期兼容层：

- `src/components/navigation`
- `src/components/workbench`
- `src/components/overlays`
- `src/pages/editor`
- `src/pages/settings`
- `src/pages/workspace/WorkspacePage.tsx`
- `src/domain`
- `src/modules`
- `src/services/local/local-storage.service.ts`
- `src/services/system.service.ts`
- `src/utils/logger.ts`

## 冻结区

以下对象当前进入冻结状态：

- `src/components/navigation`
- `src/components/workbench`
- `src/components/overlays`
- 顶层 `src/pages`
- 顶层 `src/services`
- 顶层 `src/repositories`
- 顶层 `src/stores`
- 顶层 `src/workbench`
- 顶层 `src/overlay`

冻结规则：

- 不再向这些目录新增主职责文件
- 不再新增从 `app` 直接指向这些旧目录的业务接线
- 只允许“迁出、删除、兼容过渡”三类改动

## Feature 归属约定

- `features/documents`
  - 文档元数据、文档列表、最近打开、回收站、版本元数据、文档服务、文档状态
- `features/workspace`
  - 管理态页面编排与共享页面 UI
- `features/workbench`
  - 编辑器运行时、工作台面板、工作台状态、工作台 UI
- `features/settings`
  - 设置页、诊断页、设置服务
- `features/search`
  - 搜索中心与搜索相关 UI
- `features/templates`
  - 模板与素材相关页面和 UI
- `features/recovery`
  - 恢复中心与恢复相关弹层
- `features/collaboration`
  - Team、Share、协作入口

## Shared 与 Platform 约定

- `shared`
  - 真正跨 feature 复用的 UI、组件、hooks、types、constants、lib
- `platform`
  - Tauri command bridge、logging、平台运行时能力

## 当前阶段完成标准

- `features / shared / platform` 正式目录已经建立
- 八类 feature 已有公开入口
- 迁移分区已经明确
- 下一步开始迁移 `documents` 与 `workbench` 主链路
