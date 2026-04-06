# 旧主结构退场清单

这份清单用于标记当前原型主结构在后续阶段中的退场范围。

## 将被替换的旧页面

- `src/pages/workspace/WorkspacePage.tsx`
  - 后续拆分到 `src/pages/workspace/home`、`documents`、`templates`、`search`、`archive`、`team`、`settings`
- `src/pages/editor/EditorPage.tsx`
  - 后续并入 `src/pages/workbench/WorkbenchPage.tsx`
- `src/pages/settings/SettingsPage.tsx`
  - 后续并入 `src/pages/workspace/settings/SettingsPage.tsx`

## 将被替换的旧布局

- `src/components/layout/AppLayout.tsx`
  - 后续由 `src/app/layouts/AppShell.tsx` 接管
- `src/components/layout/WorkspaceLayout.tsx`
  - 后续由 `src/app/layouts/WorkspaceLayout.tsx` 接管
- `src/components/layout/EditorLayout.tsx`
  - 后续由 `src/app/layouts/WorkbenchLayout.tsx` 接管
- `src/components/layout/WorkbenchLayout.tsx`
  - 后续由 `src/app/layouts/WorkbenchLayout.tsx` 接管

## 当前阶段约束

- 旧页面与旧布局在这一阶段仍可被现有路由临时引用
- 新增代码优先进入新目录，不再继续向旧主结构追加职责
- 下一阶段开始重写路由与顶层壳层，旧结构只保留过渡用途
