---
name: gm-antd Wrapper Layer Migration
date: 2026-06-05
updated: 2026-06-06
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

## 自定义代码清单

### 全新组件（共 ~3,436 行）

| 组件 | 代码量 | 文件数 | 依赖 |
|------|--------|--------|------|
| table-filter | 2,340 行 | 12 文件 | MobX、@gm-common/hooks、antd（Select/Cascader/DatePicker/Input）、moment |
| content-wrapper | 366 行 | 3 文件 | rc-resize-observer、antd Divider |
| sortable | 297 行 | 4 文件 | sortablejs、lodash |
| table-pagination | 136 行 | 3 文件 | @gm-common/hooks、antd Pagination/Typography |
| icon | 5 行 | 1 文件 | @ant-design/icons（createFromIconfontCN + 自定义 iconfont URL） |
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

### 其他 GM 修改

| 项目 | 说明 |
|------|------|
| `export const theme = null` | components/index.tsx 中为 Vite 构建兼容添加 |
| `export const version = '4.24.0'` | 版本号硬编码 |
| `scripts/generate-version.js` | 版本文件写入逻辑被注释掉 |
| `webpack.config.js` | 含注释掉的 gm- 前缀剥离逻辑 |

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
export type { FieldItem } from './table-filter';
export { default as TablePagination } from './table-pagination';
export { default as ContentWrapper, ContentWrapperContext } from './content-wrapper';
export { default as Sortable } from './sortable';
export { default as Icon } from './icon';

// 5. 导出自定义 locale
export { default as gmZhCN } from './locale/zh_CN';

// 6. 兼容导出
export const version = '2.0.0';
export const theme = null; // Vite 兼容（如 antd 5 不再需要可移除）
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

### Button（包装层，需处理 second 类型 + auto-loading）

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

  // 处理 'second' 类型：映射为 antd Button 的 'default' + 自定义样式
  const isSecond = props.type === 'second';
  const antdType = isSecond ? 'default' : props.type;

  return (
    <AntButton
      {...props}
      type={antdType}
      className={classNames(props.className, { 'gm-btn-second': isSecond })}
      loading={props.loading || autoLoading}
      onClick={handleClick}
    />
  );
};
```

`second` 按钮类型通过 className 注入自定义样式（CSS-in-JS），不修改 antd 内部。

### Table hooks（直接迁移，适配 antd 5 API）

- antd 5 Table 的 rc-table 升级了大版本，hook 内部引用的 Table prop 类型需要更新
- `useTableResizable` 依赖 `react-resizable`，不受 antd 版本影响
- `useTableVirtual` 依赖 `react-window`，不受 antd 版本影响
- `useTableDIY` 依赖 localStorage 和 antd Checkbox/Modal 等，需适配 antd 5 的导入路径
- `useTableSelection` 批量操作 UI 用了 antd Space/Button，需适配 antd 5
- Table.tsx 中混入的 MobX 逻辑（`useLocalStore`、`useObserver`）需要保留，但需改为从 `mobx-react` 导入

### table-filter（直接迁移，需处理多个关键变更）

核心逻辑不变（MobX store、context、子组件），但有以下改动点：

1. **内部组件引用路径** — 所有相对路径引用（`../../button`、`../../select`、`../../cascader`、`../../date-picker`、`../../input`、`../../popover`）改为从 `antd` 直接导入
2. **LocaleReceiver 迁移** — 10 个文件引用了 `../../locale-provider/LocaleReceiver`，antd 5 移除了 `LocaleReceiver`，需改用 `antd/es/locale/zh_CN` + React Context
3. **moment → dayjs** — `form.store.ts`（Moment 类型）和 `DateFilter.tsx`（moment() 运行时调用）需迁移到 dayjs
4. **rc-picker 类型** — `types.ts` 引用了 `rc-picker/lib/interface` 的 `RangeValue`/`PickerMode`，需验证 antd 5 版本的兼容性
5. **Less 样式**（104 行）转为 CSS-in-JS
6. **@gm-common/hooks** 的 `UsePaginationResult` 类型保持通过 peerDependencies 引用

### table-pagination（直接迁移）

- antd 组件引用改为从 `antd` 直接导入（Pagination、Typography）
- LocaleReceiver 迁移同上
- Less 样式（5 行）转为 CSS-in-JS
- `InfoField.tsx` 中使用了 `var(--ant-color-primary)` CSS 变量，antd 5 中变量名变为 `--ant-color-primary`（需验证）

### content-wrapper（直接迁移）

- `rc-resize-observer` 导入方式可能变化，antd 5 中可通过 `rc-resize-observer` 包直接使用
- 内部引用的 Divider 改为从 `antd` 导入
- Less 样式（37 行）转为 CSS-in-JS

### sortable（直接迁移）

- 无 antd 依赖，仅依赖 sortablejs + lodash
- `sortable_base.tsx` 使用 `UNSAFE_componentWillReceiveProps`（class 组件），React 17 下无影响

### Icon（直接迁移）

```ts
import { createFromIconfontCN } from '@ant-design/icons';
const Icon = createFromIconfontCN({
  scriptUrl: 'https://at.alicdn.com/t/c/font_4079364_omop55e0gd.js',
});
export default Icon;
```

无需改动，`@ant-design/icons` 的 `createFromIconfontCN` API 在 v5 中保持兼容。

### Locale（新建 GM locale 文件）

基于 antd 5 的 `zh_CN` locale，合并 GM 自定义字段（Table 扩展字段 + TableFilter 区域），导出为 `gmZhCN`，供业务项目通过 `ConfigProvider.locale` 使用。

### 全局样式（CSS-in-JS + Design Token 替代）

用 antd 5 的 Design Token + 全局 CSS 文件替代两个 reset Less 文件：

**reset_theme.less → Design Token：**
```tsx
<ConfigProvider theme={{
  token: {
    colorPrimary: '#0363ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#f5222d',
  }
}}>
```

**reset_component.less → 全局 CSS-in-JS 或独立 CSS 文件：**
- `.gm-modal-footer`、`.gm-drawer-footer` 等 GM 特有 class 保留为全局 CSS
- Table 行高、选中行颜色等通过 Table 的 component token 设置
- `.ant-btn.lightgrey` 保留为全局 CSS

## 关键迁移风险

### 1. LocaleReceiver 移除（高影响）

10 个文件引用了 `useLocaleReceiver`，这是 antd 内部 API，antd 5 中不再存在。

**解决方案**：在 gm-antd 内部实现一个简易的 `useGMLocale` hook，从 antd 5 的 locale context 读取配置，同时合并 GM 自定义字段。

### 2. moment → dayjs（中影响）

table-filter 的 `form.store.ts` 和 `DateFilter.tsx` 运行时使用 moment。antd 5 内部使用 dayjs。

**解决方案**：将 table-filter 中的 moment 调用替换为 dayjs。API 差异较小（`moment()` → `dayjs()`，`.format()` 保持一致）。

### 3. CSS 变量名变化（低影响）

`var(--ant-primary-color)` 在 antd 5 中可能变为 `var(--ant-color-primary)`。

**解决方案**：迁移时统一检查所有 CSS 变量引用，对齐 antd 5 的命名。

### 4. rc-* 包版本差异（中影响）

`rc-resize-observer`、`rc-picker/lib/interface` 等在 antd 5 中版本不同，可能有 API 变化。

**解决方案**：antd 5 作为直接依赖后，自定义组件不再直接引用 rc-* 包，而是通过 antd 的高层 API 访问。对于确实需要引用 rc-* 的地方（如 `rc-resize-observer`），验证兼容性后保留为直接依赖。

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
| Less 变量覆盖 → Design Token | 主题定制 | 业务侧迁移到 ConfigProvider，gm-antd 提供预设 theme |
| `moment` → `dayjs` | DatePicker 相关 | antd 5 内置 dayjs，业务侧需适配 |
| `LocaleProvider` → `ConfigProvider` | 如有使用 | 简单替换 |
| `reset_component.less` 全局样式 | 如业务项目有引用 | gm-antd 提供替代的 CSS 文件 |

可以在 gm-antd 包装层对 `dropdownClassName` → `popupClassName` 做兼容处理，减少业务侧改动。

## 工作量估算

| 阶段 | 内容 | 预估人天 |
|------|------|----------|
| 基础设施 | 新建包、配置构建、依赖安装 | 2-3 天 |
| Select 包装层 | GmSelect + useSelectAll + useFilterDeleted + DropdownRender + 样式 | 3-4 天 |
| Button 包装层 | GmButton（second 类型 + auto-loading） | 1 天 |
| Table hooks 迁移 | 6 个 hook + Table.tsx 适配 | 5-8 天 |
| table-filter 迁移 | 核心逻辑 + LocaleReceiver + moment→dayjs + 样式 CSS-in-JS | 5-7 天 |
| 其他组件迁移 | table-pagination / content-wrapper / sortable / icon | 1-2 天 |
| Locale + 全局样式 | GM locale 合并、Design Token 配置、全局 CSS | 2-3 天 |
| 构建发布 | 编译、类型声明、私有 npm 发布 | 1-2 天 |
| **合计** | | **20-30 人天** |
