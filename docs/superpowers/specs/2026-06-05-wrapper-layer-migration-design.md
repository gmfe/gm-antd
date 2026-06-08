---
name: gm-antd Wrapper Layer Migration
date: 2026-06-05
updated: 2026-06-08
status: draft
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
- **分阶段迁移**：每阶段独立可验证，每阶段可发布可用版本

## 自定义代码清单

### 全新组件（共 ~3,200 行）

| 组件 | 代码量 | 文件数 | 依赖 |
|------|--------|--------|------|
| table-filter | 2,133 行 | 12 文件（11 TS + 1 Less） | MobX、@gm-common/hooks、antd（Select/Cascader/DatePicker/Input）、moment |
| content-wrapper | 329 行 | 3 文件（2 TS + 1 Less） | rc-resize-observer、antd Divider |
| sortable | 297 行 | 4 文件 | sortablejs、lodash |
| table-pagination | 131 行 | 3 文件（2 TS + 1 Less） | @gm-common/hooks、antd Pagination/Typography |
| icon | 5 行 | 1 文件 | @ant-design/icons（createFromIconfontCN + 自定义 iconfont URL） |
| get-started | 0 行 | 仅文档 | 无 |

### Table 自定义 hooks（共 ~2,188 行）

| Hook | 代码量 | 功能 |
|------|--------|------|
| useTableDIY | 685 行（index.tsx 294 + DiyPanel.tsx 288 + util.ts 103） | 列自定义面板（显隐/排序 + localStorage 缓存） |
| useTableSelection | 558 行（index.tsx 428 + BatchActions.tsx 83 + index.less 47） | 批量选择 + 批量操作 UI |
| useTableVirtual | 389 行（index.tsx 195 + TableContainer.tsx 151 + util.ts 43） | 基于 react-window 虚拟滚动 |
| useTableResizable | 191 行（index.tsx 155 + index.less 36） | 可拖拽调整列宽（react-resizable） |
| useTableTheme | 157 行（index.tsx 120 + index.less 37） | 自定义表格主题 |
| useTableExpandable | 58 行 | 展开行状态管理 |
| useTable | 149 行 | 组合上述 6 个 hook 的便捷 hook |

Table 核心文件修改：Table.tsx 和 interface.tsx，约 841 行。Table.tsx 深度依赖 antd 4 内部 API（rc-table、rc-util、config-provider 内部路径），需完整重写为 antd 5 Table 包装层。

### 修改的 antd 组件

| 组件 | 改动范围 | 说明 |
|------|----------|------|
| Select | ~897 行（其中 ~200-300 行为 GM 自定义逻辑） | 全选 checkbox、筛选删除 switch、自定义 dropdown render（已选/未选分区） |
| Button | ~30 行新增 | 1) 新增 `'second'` 按钮类型 2) 默认 type 从 `'default'` 改为 `'second'` 3) onClick 返回 Promise 时自动 loading |

### GM 自定义 Locale

`components/locale/zh_CN.tsx` 中包含 GM 自定义的 locale 字符串：

**Table 扩展字段：** `filterCheckall`、`selectAll`、`selectionAll`、`selectAllPages`、`headerSettings`、`optionalField`、`defaultGrouping`、`theCurrentlySelectedField`、`cancel`、`save`、`selected`、`project`、`open`、`close`、`search`、`pleaseSelect`、`pleaseEnter`、`allFilteringCriteria`、`saveSettings`、`items`

**新增 TableFilter 区域：** `today`、`yesterday`、`last7days`、`last30Days`

### GM 全局样式覆盖

两个 GM 特有的 Less 文件（当前 import 被注释掉，但代码存在且可能被业务项目使用）：

**`reset_theme.less`** — 自定义主题色：
- 主色 `#0363ff`（取代 antd 默认 `#1890ff`）
- 自定义 success/warning/error 色
- CSS 变量覆盖（`--ant-primary-color` 等）

**`reset_component.less`** — 全局组件样式覆盖：
- 按钮：去除 text-shadow 和 box-shadow
- Modal/Drawer：标题 font-weight 600 + `.gm-modal-footer`/`.gm-drawer-footer` 绝对定位 footer
- Table：行高固定 48px、选中行背景 `#c3daff`
- Tabs：标题字号 16px
- Card：标题 font-weight 600、body padding 16px 24px
- Form：input-number 宽度 100%
- Message：z-index 1050
- 自定义 `.ant-btn.lightgrey` 按钮变体

---

## 迁移风险全景（逐行审查结果）

### 致命级 — antd 5 必定报错

#### R1. 所有 `.ant-*` 类名选择器失效

antd 5 用 CSS-in-JS 生成 hash 后缀的类名，所有在 Less 中通过 `.ant-table-*`、`.ant-select-*`、`.ant-popover-*` 做的全局样式覆盖**全部失效**。

| Less 文件 | 覆盖的 antd 类名 |
|-----------|------------------|
| useTableDIY/index.less | `.ant-popover-inner-content`、`.ant-popover-title`、`.ant-table-selection-column`、`.ant-table-row-level-0`、`.ant-table-cell` |
| useTableSelection/index.less | `.ant-table-selection-column`、`.ant-table-row-level-0`、`.ant-checkbox + span` |
| useTableVirtual/index.less | `.ant-table-container::before/after`、`.ant-row-selection`、`.ant-table-thead`、`.ant-table-row`、`.ant-table-row-selected` |
| useTableResizable/index.less | `.ant-table-cell.react-resizable`、`.ant-table-selection-column`、`.ant-table-thead tr th` |
| useTableTheme/index.less | `.ant-table-cell-fix-left/right`、`.ant-table-row-expand-icon-spaced`、`.ant-table-thead` |
| table-filter/index.less | `.ant-select-selection-item`、`.ant-select-selection-placeholder`、`.ant-select-selector`、`.ant-popover-inner-content` |
| select/style/index.less | 标准 antd select 样式（通过 `@{select-prefix-cls}` 引用 `.ant-select-*`，single.less 37 处、multiple.less 22 处、status.less 8 处） |
| reset_component.less | `.ant-btn`、`.ant-modal-*`、`.ant-table-*`、`.ant-tabs-*`、`.ant-card-*`、`.ant-form-*` 等（26 处全局覆盖，全部失效） |

这些 Less 文件需要完全重写为 CSS-in-JS 或全局 CSS。

#### R2. TSX 中硬编码 antd 类名全部失效

antd 5 的类名带 hash 后缀，所有在 TSX/TS 中硬编码的 antd 类名**全部失效**。

**`className?.includes()` 检测**：
- `useTableTheme/index.tsx:39` — `['ant-table-selection-column', 'placeholder'].find(name => className?.includes(name))`

**`className` 赋值**：
- `useTableVirtual/index.tsx:101` — `className="ant-table-row ant-table-row-level-0"`
- `useTableVirtual/index.tsx:120` — `'ant-table-cell gm-antd-virtual-table-cell ant-row-selection'`
- `useTableVirtual/index.tsx:140` — `'ant-table-cell gm-antd-virtual-table-cell'`
- `useTableVirtual/TableContainer.tsx` — 约 6 处 `ant-table-tbody`、`ant-table-*` 类名
- `useTableSelection/index.tsx:380` — `'ant-table-row-selected'` 用于高亮选中行

需全部改为通过 antd 5 的 API（data 属性、token、或其他方式）实现。

#### R3. `INTERNAL_HOOKS` + `transformColumns` + `convertChildrenToColumns` — rc-table 内部 API 不存在

Table.tsx 深度依赖 rc-table 内部 API：
- `INTERNAL_HOOKS` 常量（line 5 import, line 560 使用）
- `transformColumns` 内部管道
- `convertChildrenToColumns`（从 `rc-table/lib/hooks/useColumns` 导入，line 171 使用）
- `rc-table/lib/Table` 的 `RcTableProps` 类型

此外 Table.tsx 的几乎所有 import 都来自 antd 4 内部路径：`rc-table`、`rc-util/lib/omit`、`../config-provider/context`、`../_util/responsiveObserve`、`../_util/scrollTo`、`../_util/warning`。antd 5 的 Table 内部结构已完全重构。

#### R4. `rowSelection.renderCell` 回调签名可能变化

useTableDIY、useTableSelection、useTableVirtual 都使用了 `rowSelection.renderCell(value, record, index, node)`，这是 antd 4 的内部 API。

#### R5. `createPortal` 到 `document.body` — 脱离 ConfigProvider 树

useTableDIY 用 `createPortal(panel, document.body)` 渲染设置面板。antd 5 的 CSS-in-JS 依赖 ConfigProvider 上下文，portal 内容**不会继承主题/token**。需要在 portal 内手动包裹 ConfigProvider。

### 高危级 — 很可能报错

#### R6. `bordered={false}` 批量废弃

至少 5 个组件用了 `bordered={false}`，antd 5 改为 `variant="borderless"`：
- CascaderFilter、DateFilter、InputFilter、SelectFilter、Labeled 中的 Select

#### R7. `Wave` 组件移除

Button 依赖 `../_util/wave` 实现点击波纹效果。antd 5 用 CSS-in-JS 内置实现，不再有独立的 Wave React 组件。

#### R8. DatePicker `generatePicker` 架构完全不同

`date-picker/generatePicker/` 使用 antd 4 的 `momentGenerateConfig` + `generatePicker<Moment>()` 模式。antd 5 直接内置 dayjs，整个 generatePicker 基础设施不再需要。

#### R9. `rc-picker/lib/interface` 深层路径导入

`types.ts` 和 `DateFilter.tsx` 从 `rc-picker/lib/interface` 导入 `RangeValue`、`PickerMode`。antd 5 的 rc-picker 版本不同，路径可能变化。

#### R10. `components.header.cell` / `components.body.row` 覆盖模式

useTableResizable、useTableSelection、useTableVirtual、useTableTheme 都通过 `components` prop 覆盖 antd Table 的内部渲染组件（`header.cell`、`body.row`、`body.cell`）。antd 5 可能改变这些接口结构。

### 中危级 — 需要适配

#### R11. `var(--ant-primary-color)` 出现在 5+ 处

| 文件 | 位置 |
|------|------|
| DiyPanel.tsx (useTableDIY) | line 110，inline style |
| useTableSelection/index.less | line 45 |
| table-filter/index.less | lines 53, 92, 93（line 94 已注释） |
| table-filter/index.tsx | lines 209, 210，inline style |
| InfoField.tsx (table-pagination) | line 25，inline style |

共 8 处。antd 5 中 CSS 变量名变为 `--ant-color-primary`。

#### R12. 大量硬编码颜色（不支持暗色模式）

Less 和 inline style 中有 20+ 处硬编码颜色：`#fafafa`、`#333`、`#c3daff`、`#f5f5f5`、`#ebebeb`、`#707070`、`rgba(0,0,0,0.06)`、`rgba(9,109,217,0.2)` 等。

#### R13. `fade()` Less 函数

useTableDIY/index.less 使用了 Less 的 `fade()` 函数，CSS-in-JS 中没有等价物。

#### R14. `PingFangSC-Medium` 平台特定字体

useTableTheme/index.less 硬编码了 `font-family: PingFangSC-Medium, PingFang SC`。

#### R15. `document.body.style.overflow` 直接操作 DOM

useTableDIY 直接设置 `document.body.style.overflow = 'hidden'` 来锁定滚动。antd 5 有自己的滚动锁定机制。

#### R16. `location.href.replace('/#', '')` — hash 路由假设

table-filter 和 useTableDIY 都用 `location.href` 生成 cacheID。

#### R17. `--gm-framework-size-top-right-height` 外部 CSS 变量

content-wrapper 依赖一个来自 `gm-framework` 的外部 CSS 变量。

#### R18. LocaleReceiver 移除

10 个文件引用了 `useLocaleReceiver`，antd 5 不再存在此 API。

#### R19. moment → dayjs

form.store.ts（Moment 类型）、DateFilter.tsx（moment() 运行时）、types.ts（Moment 类型在 8+ 处）。

#### R20. 自定义 hook 通过相对路径导入 antd 内部组件

自定义 hook 直接引用 forked antd 的源文件路径，而非公共 API：

| Hook | 内部导入 |
|------|----------|
| useTableSelection | `import Checkbox from '../../../checkbox/Checkbox'`、`import Button from '../../../button/button'` |
| useTableVirtual | `import Empty from '../../../empty'` |
| useTableTheme | `import Tooltip from '../../../tooltip/index'` |
| BatchActions.tsx | `import Checkbox/Divider/Space from '../../../...'` |
| DiyPanel.tsx | `import Checkbox/Button/Sortable from '../../../...'` |

包装层方案中这些必须全部改为 `import { Checkbox } from 'antd'` 等。

### 现有代码 bug（迁移时可顺手修）

| 文件 | 问题 |
|------|------|
| form.store.ts:148 | `.find(item2 => item2.key !== item.key)` 逻辑错误：`find` 返回第一个匹配项，此处几乎永远为 truthy。应改为 `!_fixedFields?.find(item2 => item2.key === item.key)` 或 `.some()` |
| form.store.ts:257 | `pickBy(params, Boolean)` 过滤掉合法的 `0` 和 `false` 值 |
| button/style/index.less:135 | `background-color: none` 是无效 CSS |
| InfoField.tsx:18 | `fontFamily: 'bold'` 应该是 `fontWeight: 'bold'` |
| sortable_group.tsx:48 | `_.uniqueId()` 作为 React key 导致每次渲染重新挂载 |
| table-pagination/index.tsx:74-75 | 直接 mutation `paginationResult.paging.offset` 和 `.limit` |

---

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
│   │   └── GmButton.tsx            # second 类型 + auto-loading 逻辑
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
│   ├── sortable/                   # 自定义组件
│   ├── icon/                       # 自定义 Icon（createFromIconfontCN）
│   ├── locale/                     # GM 自定义 locale 覆盖
│   │   └── zh_CN.ts                # 合并 antd 5 locale + GM 自定义字段
│   ├── locale-adapter/             # LocaleReceiver 兼容层
│   │   └── useGMLocale.ts          # 替代 useLocaleReceiver
│   └── styles/                     # 全局样式
│       └── global.ts               # reset_component + reset_theme 的 CSS-in-JS 替代
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
    "sortablejs": "^1.x",
    "rc-resize-observer": "^1.x"
  },
  "peerDependencies": {
    "react": ">=16.9.0",
    "react-dom": ">=16.9.0",
    "@gm-common/hooks": "^2.x"
  }
}
```

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
export { useTable } from './table/useTable';

// 4. 导出自定义组件
export { default as TableFilter, TableFilterContext } from './table-filter';
export type { FieldItem } from './table-filter';
export { default as TablePagination } from './table-pagination';
export { default as ContentWrapper, ContentWrapperContext } from './content-wrapper';
export { default as Sortable } from './sortable';
export { default as Icon } from './icon';

// 5. 导出自定义 locale
export { default as gmZhCN } from './locale/zh_CN';

// 6. 兼容导出
export const version = '2.0.0';

// 7. re-export antd 5 theme（业务代码可能引用 gm-antd 的 theme）
// antd 5 的 `export { theme }` 已经通过第 1 步 re-export，无需额外处理
```

---

## 分阶段迁移计划

### 阶段 1：搭骨架 + 简单组件（2-3 天）

**目标**：新建包，re-export antd 5，业务项目能编译运行。迁移最简单的无依赖组件。

**内容**：
1. 新建 npm 包，配置 TypeScript 构建
2. `src/index.ts` — re-export antd 5 全部导出
3. 迁移 Icon（5 行，createFromIconfontCN 兼容 v5）
4. 迁移 sortable（297 行，无 antd 依赖，仅 sortablejs + lodash）
5. 迁移 content-wrapper（366 行，仅依赖 rc-resize-observer + antd Divider）
6. 搭建 LocaleReceiver 兼容层 `useGMLocale`（供后续阶段使用）
7. GM locale 合并（zh_CN.ts）
8. 全局样式：Design Token 配置（主色 #0363ff）+ 全局 CSS（gm-modal-footer 等）

**需处理的 antd 4→5 变更**：
- content-wrapper 引用的 Divider 从相对路径改为 `antd` 导入
- content-wrapper 的 Less（37 行）转 CSS-in-JS
- `--gm-framework-size-top-right-height` 外部 CSS 变量确认可用

**验证标准**：业务项目替换 `gm-antd` 后，使用 antd 原生组件 + Icon + Sortable + ContentWrapper 的页面正常工作。

### 阶段 2：修改过的组件 — Button + Select（4-5 天）

**目标**：迁移两个修改过的 antd 组件。

**Button（1 天）**：
- 包装 antd 5 Button
- `second` 类型通过 className 注入自定义样式
- auto-loading：检测 onClick 返回 Promise
- 不再依赖 `Wave` 组件（antd 5 内置）
- `second` 按钮样式（原 Less 中 `&-second` 块）转为 CSS-in-JS
- 修复 `background-color: none` bug → `transparent`

**Select（3-4 天）**：
- 包装 antd 5 Select
- `popupRender` 替代 `dropdownRender`
- `onOpenChange` 替代 `onDropdownVisibleChange`
- 受控 `options`/`value`/`onChange` 管理全选和筛选删除
- 全选/筛选删除逻辑提取为 `useSelectAll`、`useFilterDeleted`
- 自定义 dropdown 样式（110 行 Less）转为 CSS-in-JS
- 不依赖任何 antd 内部 API

**验证标准**：业务项目使用 Button（含 second 类型、auto-loading）和 Select（含全选、筛选删除）功能正常。

### 阶段 3：table-filter（5-7 天）

**目标**：迁移最复杂的自定义组件。

**改动清单**：
1. **moment → dayjs**：form.store.ts（Moment 类型）、DateFilter.tsx（moment() 运行时）、types.ts（8+ 处 Moment → Dayjs）
2. **LocaleReceiver → useGMLocale**：6 个文件（index.tsx、CascaderFilter、DateFilter、InputFilter、SelectFilter、Setting）
3. **内部组件引用路径**：Button、Popover、Cascader、DatePicker、Input、Select、Checkbox、Divider、Sortable — 从相对路径改为 `antd` 直接导入
4. **Less 样式（104 行）转 CSS-in-JS**：包括 `.ant-select-*` 类名覆盖（需用 antd 5 的方式替代）
5. **`bordered={false}` → `variant="borderless"`**：CascaderFilter、DateFilter、InputFilter、SelectFilter、Labeled
6. **`var(--ant-primary-color)` → `var(--ant-color-primary)`**：index.less 中 3 处
7. **`rc-picker/lib/interface` 导入**：types.ts、DateFilter.tsx 中的 `RangeValue`/`PickerMode` 需验证 antd 5 版本
8. **硬编码颜色替换**：`#d6d6d6`、`rgba(9,109,217,0.2)`、`#f5f5f5`、`rgb(113,113,112)` 等

**顺手修 bug**：
- form.store.ts:148 `.find(item2 => item2.key !== item.key)` → `!_fixedFields?.find(item2 => item2.key === item.key)`（find 用 !== 几乎永远为 truthy）
- form.store.ts:257 `pickBy(Boolean)` → 不过滤 0/false

**验证标准**：业务项目使用 TableFilter（含各种筛选项、保存设置、重置）功能正常。

### 阶段 4：table-pagination（1 天）

**改动清单**：
1. antd 组件引用改为从 `antd` 导入
2. LocaleReceiver → useGMLocale
3. Less（5 行）转 CSS-in-JS
4. `var(--ant-primary-color)` → `var(--ant-color-primary)`（InfoField.tsx）
5. 修复 `fontFamily: 'bold'` → `fontWeight: 'bold'`

### 阶段 5：Table hooks（最复杂，5-8 天）

**目标**：迁移 6 个自定义 hook + Table.tsx/interface.tsx 修改。

这是风险最高的阶段，因为大量依赖 antd 4 Table 的内部 API。

**各 hook 迁移要点**：

| Hook | 核心风险 | 处理策略 |
|------|----------|----------|
| useTableDIY | `createPortal` 脱离 ConfigProvider、`.ant-popover-*` 类名、`document.body.style.overflow`、Less `fade()` 函数、内部组件导入（Checkbox/Button/Sortable） | portal 内包裹 ConfigProvider、样式全部重写为 CSS-in-JS、用 antd 5 Modal 的 scroll lock |
| useTableSelection | `components.body.row` 覆盖、`rowSelection.renderCell` 签名、`'ant-table-row-selected'` 硬编码类名、内部组件导入（Checkbox/Button/Divider/Space） | 验证 antd 5 的 components prop 接口、用 antd 5 的 rowSelection API |
| useTableVirtual | `components.header/body` 全面覆盖、TSX 中约 10 处 `.ant-table-*` 硬编码类名、`rc-resize-observer`、内部组件导入（Empty） | **可能需要近完全重写**、验证 react-window 与 antd 5 Table 的兼容性 |
| useTableResizable | `components.header.cell` 覆盖、`.ant-table-cell` 类名、`react-resizable` 集成 | 验证 antd 5 的 header cell 组件接口 |
| useTableTheme | `className?.includes('ant-table-selection-column')`、`.ant-table-*` 类名、硬编码颜色/字体、内部组件导入（Tooltip） | 用 data 属性或 props 替代类名检测、所有样式用 Design Token |
| useTableExpandable | `expandIcon` 回调签名 | 验证 antd 5 的 ExpandIconProps 接口 |
| useTable | 组合以上 6 个 hook | 跟随各 hook 的 API 变化更新组合逻辑 |

**Table.tsx 修改**：
- 移除 `INTERNAL_HOOKS`、`transformColumns`、`convertChildrenToColumns` 等 rc-table 内部 API
- 几乎所有 import 都来自 antd 4 内部路径（rc-table、rc-util、config-provider），需完整重写为 antd 5 包装层
- `isResizable` prop 保留，但实现方式适配 antd 5
- 注意：Table.tsx 不使用 MobX，MobX 仅在 table-filter 中使用

**所有内部组件导入改为 antd 直接导入**：
- `import Checkbox from '../../../checkbox/Checkbox'` → `import { Checkbox } from 'antd'`
- `import Button from '../../../button/button'` → `import { Button } from './button/GmButton'`（使用 GM 包装版）
- `import Empty from '../../../empty'` → `import { Empty } from 'antd'`
- `import Tooltip from '../../../tooltip/index'` → `import { Tooltip } from 'antd'`

**TSX 中硬编码 antd 类名重写**：
- useTableVirtual（~10 处）、useTableSelection（1 处）、useTableTheme（1 处）中的 `.ant-table-*` 类名
- 通过 antd 5 的 token、data 属性或其他 API 替代

**所有 Less 文件重写**：
- useTableDIY/index.less（115 行）— `.ant-popover-*`、`.ant-table-selection-column` 等全部失效
- useTableSelection/index.less（47 行）— `.ant-table-*` 覆盖
- useTableVirtual/index.less（82 行）— 大量 `.ant-table-*` 覆盖 + 硬编码颜色
- useTableResizable/index.less（36 行）— `.ant-table-cell` 覆盖
- useTableTheme/index.less（37 行）— `.ant-table-*` + 硬编码颜色/字体

**验证标准**：业务项目使用所有 Table hooks（DIY 面板、批量选择、虚拟滚动、可调列宽、主题、展开行、useTable 组合）功能正常。

---

## 各阶段依赖关系

```
阶段 1（骨架 + 简单组件 + locale 层 + 全局样式）
  └→ 阶段 2（Button + Select）
       └→ 阶段 3（table-filter）— 依赖 Select wrapper + locale 层 + moment→dayjs
  ┌→ 阶段 1（locale 层）
  └→ 阶段 4（table-pagination）— 依赖 locale 层
       └→ 阶段 5（Table hooks）— 最复杂，依赖所有前置阶段
```

## 工作量总估算

| 阶段 | 内容 | 预估人天 | 累计 |
|------|------|----------|------|
| 1 | 骨架 + Icon + sortable + content-wrapper + locale + 全局样式 | 2-3 天 | 2-3 |
| 2 | Button + Select 包装层 | 4-5 天 | 6-8 |
| 3 | table-filter 迁移 | 5-7 天 | 11-15 |
| 4 | table-pagination 迁移 | 1 天 | 12-16 |
| 5 | Table hooks 迁移（含 useTable 组合 hook） | 6-9 天 | 18-25 |
| - | 构建发布 + 集成测试 | 1-2 天 | 19-27 |
| **合计** | | **19-27 人天** | |

## 业务项目升级影响

### 无需改动

- `import { Button, Select, TableFilter } from 'gm-antd'` — 路径不变
- Select 的自定义 props（`isRenderDefaultBottom`、`isShowCheckedAll` 等）— 接口不变
- Table hooks 的调用方式 — 不变
- table-filter / table-pagination / content-wrapper — 接口不变
- Icon 组件 — 接口不变

### 需要改动（antd 4→5 breaking changes）

| 变更 | 影响范围 | 处理方式 |
|------|----------|----------|
| `visible` → `open` | Modal/Drawer/Tooltip/Popover 等 | 业务侧全局替换 |
| `dropdownClassName` → `popupClassName` | Select/Cascader/DatePicker 等 | 可在包装层做兼容 |
| `message.warn()` → `message.warning()` | message 调用 | 业务侧替换 |
| Less 变量覆盖 → Design Token | 主题定制 | gm-antd 提供预设 theme |
| `moment` → `dayjs` | DatePicker 相关 | antd 5 内置 dayjs，业务侧需适配 |
| `LocaleProvider` → `ConfigProvider` | 如有使用 | 简单替换 |
| `reset_component.less` 全局样式 | 如业务项目有引用 | gm-antd 提供替代的 CSS 文件 |
| `bordered` → `variant` | 如业务项目有使用 | 可在包装层做兼容 |
