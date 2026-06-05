---
name: gm-antd Wrapper Layer Migration
date: 2026-06-05
status: approved
---

# gm-antd 包装层迁移设计

## 背景

gm-antd 当前是基于 antd 4.24.x 源码的 fork（含 25,600+ antd 原始 commit + 自定义修改）。每次 antd 升级都需要手动合并大量上游代码，维护成本极高。

**目标**：将 gm-antd 从 fork 模式改为包装层模式 — 直接依赖 antd 5 作为 npm 包，通过 wrapper/export 方式提供自定义组件和修改过的组件。未来 antd 升级只需改版本号。

## 约束

- **React 17**：业务项目暂不升级 React，antd 5 支持 React 17
- **MobX**：table-filter 继续使用 MobX 做内部状态管理
- **发布到私有 npm**
- **业务项目 < 5 个**，可以接受少量 API 变更
- **CSS-in-JS**：自定义组件样式从 Less 迁移到 CSS-in-JS
- **全量 re-export antd**：业务代码 `import { Button } from 'gm-antd'` 保持不变

## 自定义代码清单

### 全新组件（共 ~3,139 行）

| 组件 | 代码量 | 文件数 | 依赖 |
|------|--------|--------|------|
| table-filter | 2,340 行 | 12 文件 | MobX、@gm-common/hooks、antd（Select/Cascader/DatePicker/Input） |
| content-wrapper | 366 行 | 3 文件 | React Context |
| table-pagination | 136 行 | 3 文件 | @gm-common/hooks |
| sortable | 297 行 | 4 文件 | sortablejs |
| get-started | 0 行 | 仅文档 | 无 |

### Table 自定义 hooks（共 ~2,235 行）

| Hook | 代码量 | 功能 |
|------|--------|------|
| useTableDIY | 800 行 | 列自定义面板（显隐/排序 + localStorage 缓存） |
| useTableSelection | 558 行 | 批量选择 + 批量操作 UI |
| useTableVirtual | 471 行 | 基于 react-window 虚拟滚动 |
| useTableResizable | 191 行 | 可拖拽调整列宽（react-resizable） |
| useTableTheme | 157 行 | 自定义表格主题 |
| useTableExpandable | 58 行 | 展开行状态管理 |

Table 核心文件修改：Table.tsx（混入 MobX）和 interface.tsx，约 841 行。

### 修改的 antd 组件

| 组件 | 改动范围 | 说明 |
|------|----------|------|
| Select | ~500 行新增 | 全选 checkbox、筛选删除 switch、自定义 dropdown render（已选/未选分区） |
| Button | ~20 行新增 | onClick 返回 Promise 时自动 loading |

## 包结构

```
gm-antd/
├── src/
│   ├── index.ts                    # 统一导出
│   ├── select/                     # 包装 antd Select
│   │   ├── GmSelect.tsx            # 主组件，包装 antd Select
│   │   ├── useSelectAll.ts         # 全选逻辑 hook
│   │   ├── useFilterDeleted.ts     # 筛选删除逻辑 hook
│   │   ├── DropdownRender.tsx      # 自定义 dropdown 渲染（已选/未选分区）
│   │   └── styles.ts              # CSS-in-JS 样式
│   ├── button/                     # 包装 antd Button
│   │   └── GmButton.tsx            # auto-loading 逻辑
│   ├── table/                      # re-export antd Table + 自定义 hooks
│   │   ├── index.ts                # re-export antd Table，附加 hooks
│   │   ├── useTableDIY/
│   │   ├── useTableSelection/
│   │   ├── useTableVirtual/
│   │   ├── useTableResizable/
│   │   ├── useTableTheme/
│   │   └── useTableExpandable/
│   ├── table-filter/               # 自定义组件（MobX）
│   ├── table-pagination/           # 自定义组件
│   ├── content-wrapper/            # 自定义组件
│   └── sortable/                   # 自定义组件
├── package.json
└── tsconfig.json
```

## 依赖

```json
{
  "dependencies": {
    "antd": "^5.x",
    "@ant-design/icons": "^5.x",
    "classnames": "^2.x",
    "lodash": "^4.x",
    "mobx": "^6.x",
    "mobx-react": "^7.x",
    "react-resizable": "^3.x",
    "react-window": "^1.x",
    "sortablejs": "^1.x"
  },
  "peerDependencies": {
    "react": ">=16.9.0",
    "react-dom": ">=16.9.0",
    "@gm-common/hooks": "^2.x"
  }
}
```

antd 5 支持 React 17，不会与当前业务项目冲突。

## 导出策略

```ts
// src/index.ts

// 1. 全量 re-export antd（业务代码 import 路径不变）
export * from 'antd';

// 2. 覆盖修改过的组件（同名导出覆盖 re-export）
export { default as Select } from './select/GmSelect';
export { default as Button } from './button/GmButton';
export { default as Table } from './table';

// 3. 导出自定义 hooks
export { useTableDIY } from './table/useTableDIY';
export { useTableSelection } from './table/useTableSelection';
export { useTableVirtual } from './table/useTableVirtual';
export { useTableResizable } from './table/useTableResizable';
export { useTableTheme } from './table/useTableTheme';
export { useTableExpandable } from './table/useTableExpandable';

// 4. 导出自定义组件
export { default as TableFilter, TableFilterContext } from './table-filter';
export { default as TablePagination } from './table-pagination';
export { default as ContentWrapper, ContentWrapperContext } from './content-wrapper';
export { default as Sortable } from './sortable';

// 5. 兼容导出
export const version = '2.0.0';
```

## 各组件迁移策略

### Select（包装层，不改 antd 内部）

**可行性已验证**：antd 5 的 `popupRender` API 足以实现全部自定义功能。

实现方式：
- `popupRender` 替代 `dropdownRender`（antd 5 重命名）
- 受控 `options`/`value`/`onChange` 管理全选和筛选删除
- `onOpenChange` 替代 `onDropdownVisibleChange`（antd 5 重命名）
- `filterOption={false}` + 自定义搜索过滤
- 全选/筛选删除逻辑提取为独立 hooks（`useSelectAll`、`useFilterDeleted`）
- 样式从 Less 转为 CSS-in-JS

### Button（包装层，最简单）

```tsx
const GmButton = (props) => {
  const [autoLoading, setAutoLoading] = useState(false);
  const handleClick = (e) => {
    const result = props.onClick?.(e);
    if (result && typeof result.then === 'function') {
      setAutoLoading(true);
      result.finally(() => setAutoLoading(false));
    }
  };
  return <AntButton {...props} loading={props.loading || autoLoading} onClick={handleClick} />;
};
```

### Table hooks（直接迁移，适配 antd 5 API）

- antd 5 Table 的 rc-table 升级了大版本，hook 内部引用的 Table prop 类型需要更新
- `useTableResizable` 依赖 `react-resizable`，不受 antd 版本影响
- `useTableVirtual` 依赖 `react-window`，不受 antd 版本影响
- `useTableDIY` 依赖 localStorage 和 antd Checkbox/Modal 等，需适配 antd 5 的导入路径
- `useTableSelection` 批量操作 UI 用了 antd Space/Button，需适配 antd 5
- Table.tsx 中混入的 MobX 逻辑（`useLocalStore`、`useObserver`）需要保留，但需改为从 `mobx-react` 导入

### table-filter（直接迁移，样式改 CSS-in-JS）

- 核心逻辑不变（MobX store、context、子组件）
- SelectFilter/CascaderFilter/DateFilter/InputFilter 子组件引用的 antd 组件改为从 `antd` 包导入
- Less 样式（104 行）转为 CSS-in-JS
- `@gm-common/hooks` 的 `UsePaginationResult` 类型保持通过 peerDependencies 引用

### table-pagination / content-wrapper / sortable（直接迁移）

- 代码量小，改动简单
- content-wrapper 的 Less（37 行）和 table-pagination 的 Less（5 行）转 CSS-in-JS
- sortable 无样式文件，直接迁移

## 业务项目升级影响

### 无需改动

- `import { Button, Select, TableFilter } from 'gm-antd'` — 路径不变
- Select 的自定义 props（`isRenderDefaultBottom`、`isShowCheckedAll` 等）— 接口不变
- Table hooks 的调用方式 — 不变
- table-filter / table-pagination / content-wrapper — 接口不变

### 需要改动（antd 4→5 breaking changes）

| 变更 | 影响范围 | 处理方式 |
|------|----------|----------|
| `visible` → `open` | Modal/Drawer/Tooltip/Popover 等 | 业务侧全局替换 |
| `dropdownClassName` → `popupClassName` | Select/Cascader/DatePicker 等 | 可在包装层做兼容 |
| `message.warn()` → `message.warning()` | message 调用 | 业务侧替换 |
| Less 变量覆盖 → Design Token | 主题定制 | 业务侧迁移到 ConfigProvider |
| `moment` → `dayjs` | DatePicker 相关 | antd 5 内置 dayjs，业务侧需适配 |

可以在 gm-antd 包装层对 `dropdownClassName` → `popupClassName` 做兼容处理，减少业务侧改动。

## 工作量估算

| 阶段 | 内容 | 预估人天 |
|------|------|----------|
| 基础设施 | 新建包、配置构建、依赖安装 | 2-3 天 |
| Select 包装层 | GmSelect + useSelectAll + useFilterDeleted + DropdownRender + 样式 | 3-4 天 |
| Button 包装层 | GmButton auto-loading | 0.5 天 |
| Table hooks 迁移 | 6 个 hook + Table.tsx 适配 | 5-8 天 |
| table-filter 迁移 | 核心逻辑 + 样式 CSS-in-JS | 3-5 天 |
| 其他组件迁移 | table-pagination / content-wrapper / sortable | 1-2 天 |
| 构建发布 | 编译、类型声明、私有 npm 发布 | 1-2 天 |
| **合计** | | **16-25 人天** |
