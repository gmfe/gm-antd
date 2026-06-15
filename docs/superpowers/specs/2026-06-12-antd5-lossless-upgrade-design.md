---
name: gm-antd antd5 无损升级(兼容加固)
date: 2026-06-12
status: draft
related: 2026-06-05-wrapper-layer-migration-design.md
---

# gm-antd antd5 无损升级设计方案

> 本文档是 [2026-06-05 包装层迁移设计](./2026-06-05-wrapper-layer-migration-design.md) 的后续。
> 前者把 gm-antd 从「antd 4 fork」改造成「antd 5 包装层」,Phases 1–5 已提交;
> 本文档解决**改造后仍未真正跑在 antd 5 上**的问题,并做到对业务消费侧的**零改动无损升级**。

## 1. 背景与问题定位

包装层迁移的 5 个阶段代码已合入 `src/`,`package.json` 直接依赖也已写成 `antd: ^5.12.0`。
但实际验证(`tsc -p tsconfig.build.json` + `npm run build:wrapper`)发现:**`src/` 目前根本没有跑在 antd 5 上。**

### 1.1 根因:antd 5 未真正安装

| 位置 | 实际值 |
|------|--------|
| `package.json` 直接依赖 | `antd: ^5.12.0` ✅ |
| `yarn.lock` 解析 antd 5 | `5.29.3` ✅(已可解析) |
| **`node_modules/antd` 顶层实际版本** | **`4.24.10`** ❌(陈旧,未随 package.json 刷新) |

- antd 4 来自 devDependency `@ant-design/bisheng-plugin@^3.3.0-alpha.4`(旧 bisheng 文档工具链声明 `antd "^4.0.0"`)。
- `yarn.lock` 中 antd 4 / antd 5 两条共存,但顶层 `node_modules/antd` 停留在 4.24.10——`package.json` 从 v4 改到 v5 后**未重新安装依赖**(`node_modules` 是 2025-12 的旧物)。

### 1.2 证据:src/ 为 antd 5 写,却加载到 antd 4 → 22 个类型错误

典型错误全部指向「v5 API 撞上 v4 类型」:

- `Property 'variant' does not exist on InputProps/SelectProps/CascaderProps`(`variant` 为 antd 5.13+)
- `Cannot find module 'antd/es/theme/useToken'`(antd 4 无此路径;v5 应使用公共 `theme.useToken()`)
- `Cannot find module 'antd/es/locale'`(antd 4 的 `antd/es/locale` 无 index)
- `Type 'Dayjs' is not assignable to 'Moment'`(antd 4 DatePicker 是 Moment 类型)
- `Type '"second"' is not assignable to Button type`(antd 4 Button 无 `second`)

### 1.3 附加问题:`build:wrapper` 无法运行

`tsup: command not found`——构建脚本依赖的 tsup **未安装**,包装层当前完全无法构建。

### 1.4 即使装好 antd 5 仍存在的残留兼容问题

- 废弃 API:`dropdownRender`(→`popupRender`)、`onDropdownVisibleChange`(→`onOpenChange`)、`dropdownMatchSelectWidth`(→`popupMatchSelectWidth`)
- 深路径 import:`antd/es/theme/useToken`、`antd/es/locale`、`antd/es/select`、`antd/es/table/interface`、`antd/es/checkbox`、`rc-table/lib/interface`、`rc-resize-observer`
- `useTableDIY` 中 `createPortal(panel, document.body)` 脱离 ConfigProvider 上下文(theme/locale 不生效)
- `useTableDIY` 手动 `document.body.style.overflow` 滚动锁,与 antd 5 自带机制冲突
- `useTableTheme` 中 `className?.includes('ant-table-selection-column')` 脆弱判定
- 42 处 `.ant-*` 全局 CSS 与 CSS-in-JS 抢优先级;`global.ts:94` 硬编码选中行色 `#c3daff` 绕过主题
- `gmTheme` 未开 `cssVar`,导致 13 处内联 `var(--ant-color-primary)` 可能落空(内联样式无 fallback)

## 2. 目标与约束

### 2.1 目标

1. **真正跑在 antd 5 上**:顶层 `node_modules/antd` = antd 5.x,`src/` 编译 0 错误,`tsup` 构建产出 `dist/`。
2. **纯 antd 5 wrapper 仓库**:退役 `components/` fork 与 bisheng 旧工具链,彻底成为 antd 5 + dumi 纯净仓库。
3. **业务侧零改动无损升级**:gm-antd 包装层**全吸收** antd 4→5 自身的 breaking changes,业务项目升级后不改一行代码。

### 2.2 约束(继承自前序设计)

- React 17(antd 5 支持,运行时会有警告,可接受)
- 业务项目 < 5 个
- 发布到私有 npm
- `import { X } from 'gm-antd'` 路径不变
- table-filter 内部继续使用 MobX

## 3. 终态架构

```
gm-antd/                         # 纯净的 antd 5 包装仓库
├── src/
│   ├── index.ts                 # 入口:re-export antd5 + 同名覆盖(自定义组件 + 兼容垫片)
│   ├── compat/                  # 【新增】antd 4→5 breaking change 兼容垫片层
│   │   ├── withCompat.ts        # 通用 prop 改名工具(visible→open / bordered→variant 等)
│   │   ├── withBaseSelectCompat.ts   # Select 系通用垫片(dropdownClassName/popupRender 等)
│   │   ├── Modal.tsx  Drawer.tsx  Tooltip.tsx  Popover.tsx  Dropdown.tsx  Popconfirm.tsx
│   │   ├── Select.tsx  Cascader.tsx  DatePicker.tsx  TreeSelect.tsx  Input.tsx  InputNumber.tsx
│   │   ├── message.ts           # message.warn 别名
│   │   ├── Tabs.tsx             # TabPane→items 兼容(若业务需要)
│   │   └── index.ts
│   ├── button/ select/ table/ table-filter/ table-pagination/
│   ├── content-wrapper/ sortable/ icon/ locale/ locale-adapter/ styles/
│   └── (各组件残留 v5 问题在本方案中一并修复)
├── doc/  .dumirc.ts             # dumi 文档(保留)
├── legacy/components/           # 【搬迁】旧 antd4 fork 源码,只读归档,下个版本删除
├── package.json                 # 移除 bisheng / antd-tools / 显式 rc-* 等旧依赖
└── tsup.config.ts               # 已有,补装 tsup
```

**同名覆盖机制**:`src/index.ts` 先 `export * from 'antd'`,再用同名导出覆盖优先级。业务侧:
- `import { Modal, DatePicker, Select } from 'gm-antd'` → 拿到**垫片版**(接受旧 v4 API,内部翻译)
- `import { Button, Table } from 'gm-antd'` → 拿到 GM 增强版
- 其余原生 antd 组件 → 原样透传

## 4. 三层执行计划

### Layer 0 — 解阻塞(约 1 天)

> ⚠️ 本层有两处「装好 antd 5」的非平凡前置,否则会陷入**编译通过但运行时崩溃**:
> - yarn classic 在 antd 4/5 双版本下**不保证**把 antd 5 提升到顶层(提升启发式按「被引用次数」而非直接/间接依赖,antd 4 被引用次数远多 → 见 R1);
> - package.json 里 ~30 个 antd 4 时代的 `rc-*` 直接依赖会被提升到顶层,污染 antd 5 内部 `require('rc-*')` 的解析(见 R2)。

| # | 动作 | 解决 |
|---|------|------|
| 0.1 | `package.json` 增加 `"resolutions": { "antd": "^5.12.0" }`,强制全树 antd 统一到 5.x | 修 R1:消除 antd 4/5 提升歧义 |
| 0.2 | 从 `dependencies` 移除 antd 5 已自带的 `rc-*` 直接依赖(约 30 个,见下清单),**仅保留 `rc-resize-observer`** | 修 R2:消除顶层旧版 rc-* 污染 antd 5 内部解析 |
| 0.3 | `rm -rf node_modules yarn.lock && yarn install` | 让 0.1/0.2 变更真正生效(刷新陈旧 node_modules) |
| 0.4 | `yarn add -D tsup @types/sortablejs` | 修 `tsup: command not found` |
| 0.5 | 校验 `node_modules/antd/package.json` 的 version 为 5.x;`npm ls antd` 确认无顶层 antd 4 | 验证 R1/R2 已解 |
| 0.6 | `tsc -p tsconfig.build.json` 复核;`npm run build:wrapper` 产出 `dist/` | 验证构建链通 |

**移除的 rc-* 直接依赖清单(antd 5 已自带)**:
`rc-cascader`、`rc-checkbox`、`rc-collapse`、`rc-dialog`、`rc-drawer`、`rc-dropdown`、`rc-field-form`、`rc-image`、`rc-input`、`rc-input-number`、`rc-mentions`、`rc-menu`、`rc-motion`、`rc-notification`、`rc-pagination`、`rc-picker`、`rc-progress`、`rc-rate`、`rc-segmented`、`rc-select`、`rc-slider`、`rc-steps`、`rc-switch`、`rc-table`、`rc-tabs`、`rc-textarea`、`rc-tooltip`、`rc-tree`、`rc-tree-select`、`rc-trigger`、`rc-upload`、`rc-util`。
**保留**:`rc-resize-observer`(gm-antd 直接 import)、`react-resizable`、`react-window`、`sortablejs`(非 antd 自带)。

**出口标准**:`node_modules/antd` = antd 5.x 且无顶层 antd 4;`tsup` 构建产出 `dist/`;`tsc` 剩余错误 ≤ 12,且**全部**属于 Layer 1 范畴(深路径 import / 废弃 API / 类型适配 / demo 签名 / 真实 src bug),**无 module-not-found**。

> **错误构成说明**:当前 22 个错误中,约 10 个是版本错配(`variant` 不存在、`useToken` 路径、Moment 类型、`second` 类型),装好 antd 5 后自动消失;约 12 个是真实 `src/` bug(demo 签名漂移、`SortableDataItem` 未导出、`TableContainer` 空值、`onBlurCapture` 等),归属 Layer 1B 代码修复,**非免费版本红利**。

### Layer 1 — 兼容垫片 + 残留 v5 修复(约 3-4 天,核心工作量)

#### 1A. 兼容垫片层(全吸收 antd 4→5 breaking changes)

垫片覆盖矩阵(按 antd 官方 v4→v5 迁移指南逐项,标注难度):

| breaking change | 影响组件 | 垫片做法 | 难度 |
|-----------------|---------|---------|------|
| `visible` → `open`、`onVisibleChange` → `onOpenChange` | Modal / Drawer / Dropdown / Popover / Popconfirm / Tooltip | `withCompat` 通用映射 | 易 |
| `dropdownClassName` → `popupClassName` | Select / Cascader / TreeSelect / DatePicker / AutoComplete / Mentions | BaseSelect 通用垫片 | 易 |
| `dropdownMatchSelectWidth` → `popupMatchSelectWidth` | 同上 | 同上 | 易 |
| `dropdownRender` → `popupRender` | 同上 | 同上 | 易 |
| `onDropdownVisibleChange` → `onOpenChange` | 同上 | 同上 | 易 |
| `bordered` → `variant` | Input / Select / Cascader / DatePicker / InputNumber / Card | 接收 `bordered={false}` → `variant="borderless"`。**注:antd v5 仍接受 `bordered`(仅警告),v6 才移除** | 易(消警告) |
| `destroyOnClose` → `destroyOnHidden`(Modal) | Modal | 映射 | 易 |
| `message.warn()` → `message.warning()` | message 实例 | 垫片 message 挂 `warn` 别名 | 易 |
| `moment` → `dayjs`(DatePicker/RangePicker) | DatePicker | **边界转换**,见决策 B | 中-难 |
| `Tabs.TabPane` → `items` | Tabs | children→items 运行时转换,或引 `@ant-design/compatible`。**注:antd v5 仍渲染 TabPane(仅警告),v6 才移除** | 中(消警告) |
| `Menu.Item` children → `Menu items` | Menu | 同 Tabs 的 children→items 转换。**业务极可能用 `<Menu.Item>` 写法,务必纳入**(见 Q1) | 中(消警告) |

垫片实现规范:
- 每个垫片组件 = 一个薄 `forwardRef` 包装,接收完整 v4 + v5 props 并集,内部把 v4 别名翻译为 v5 后透传给 antd 5 组件。
- 通用改名逻辑抽到 `withCompat.ts` / `withBaseSelectCompat.ts`,避免重复。
- 垫片组件从 `src/index.ts` 同名导出,覆盖 `export * from 'antd'` 的同名**值**导出。

> **类型导出陷阱(I3,重要)**:`export * from 'antd'` 会 re-export antd 的**类型**(`SelectProps`、`DatePickerProps` 等)。但 `export *` **不会被同名 `export type` 覆盖**——若业务写 `import { Select, SelectProps } from 'gm-antd'`,拿到的 `SelectProps` 仍是 antd v5 版,`dropdownClassName` 等旧 prop 在**类型层**会报错(运行时垫片照常工作)。这会让"零改动"在 TypeScript 业务里打折扣。
>
> **决策**:由于 `export *` **无法选择性排除个别名字**,采用**过滤式再导出**:新建 `src/compat/antd-reexport.ts`,从 `antd` 显式 re-export「除垫片组件外」的全部导出;`src/index.ts` 改 `export * from './compat/antd-reexport'`,再对垫片组件**显式导出值 + 加宽后的 props 类型(V4 ∪ V5)**。备选机制:保留 `export * from 'antd'` + 用 `declare module` 模块增强加宽垫片类型(更省事但侵入全局类型)。两机制择一,**精确选型在实现计划阶段定**。无论哪种,目标一致:业务侧 `import { Select, SelectProps } from 'gm-antd'` 拿到的类型与运行时都接受 v4 旧 API。

#### 1B. 残留 v5 问题修复(逐项闭环)

| 问题 | 位置 | 修复 |
|------|------|------|
| `createPortal` 脱离 ConfigProvider | `src/table/hooks/useTableDIY/index.tsx` | portal 内容内手动包 `<ConfigProvider>`(继承 theme/locale) |
| `antd/es/theme/useToken` 深路径 | useTableSelection / useTableVirtual / TableContainer(3 处) | 改 `import { theme } from 'antd'; theme.useToken()` |
| `antd/es/locale` 深路径 | useGMLocale.ts / zh_CN.ts | 改从 `antd` 公共入口或保留 deep path 但加注释 |
| `antd/es/select` / `antd/es/table/interface` / `antd/es/checkbox` 深路径 | GmSelect / interface / Setting | 改从 `antd` 公共入口导入类型 |
| `rc-table/lib/interface` 深路径 | `src/table/interface.ts:14` | 改 `import type { ColumnType } from 'antd'` |
| `rc-resize-observer` 深导入 | content-wrapper / table-filter / useTableVirtual(3 处) | 显式列入 dependencies(已声明 `rc-resize-observer: ^1.2.0`) |
| 42 处 `.ant-*` 全局 CSS | `src/styles/global.ts` / `src/table/styles/table-hooks.css` | token 优先;`global.ts:94` 选中行色 `#c3daff` 改 `var(--ant-color-primary-bg)` |
| `gmTheme` 未开 cssVar | `src/styles/theme.ts` | 加 `cssVar: true`,让 13 处 `var(--ant-color-primary)` 生效 |
| 手动 `document.body.style.overflow` | useTableDIY(3 处) | 改用 antd 5 自带滚动锁(Modal 化或移除) |
| `className?.includes('ant-table-selection-column')` | useTableTheme:44 | 改 data 属性 / props 判定 |
| 既有 bug(顺手修) | form.store.ts find 逻辑 / pickBy(Boolean) / InfoField fontFamily→fontWeight / sortable uniqueId key 等 | 一并修 |
| demo 类型不匹配 | use-table-*/demos/*(7 处) | 修正 demo 使其匹配 hook 真实签名 |

### Layer 2 — 退役旧 antd 4 世界(约 1 天)

| # | 动作 |
|---|------|
| 2.1 | `components/` → 移到 `legacy/components/`(只读归档,不参与构建);打 git tag `legacy/antd4-fork` 留底 |
| 2.2 | 移除 devDeps:`@ant-design/bisheng-plugin`、`@ant-design/tools`、`bisheng`、`bisheng-plugin-*`、`antd-img-crop` 等 bisheng 旧站工具 |
| 2.3 | 移除 bisheng 脚本:`compile`/`dist`/`start`/`site*`/`predeploy`/`deploy` 等;保留 `build:wrapper`/`doc:*` |
| 2.4 | 根 `tsconfig.json` 删除 `paths` 中 `antd → components/index.tsx` 的别名(已无 fork 冲突) |
| 2.5 | `.dumirc.ts` 移除 `antd → node_modules/antd` 的临时 alias(Layer 0 后已无意义) |
| 2.6 | 移除根 `tsconfig.json`、`webpack.config.js`、`.antd-tools.config.js` 等 antd4 fork 专用配置(确认无其他引用后) |

> 注:antd 自带的 `rc-*` 直接依赖已在 **Layer 0.2** 移除(属运行时正确性前置,不能拖到本层)。

**出口标准**:`node_modules` 不再有顶层 antd 4;`package.json` 无 bisheng/rc-* 旧依赖;`src/` 独立编译 + `tsup` 构建 + `dumi` 文档站三者均通过。

## 5. 关键决策

| 决策 | 选择 | 备选 | 理由 |
|------|------|------|------|
| **A. 垫片架构** | A1 每组件薄包装 + 同名 re-export 覆盖 | A2 单点 props 代理拦截;`@ant-design/compatible` 官方包 | A1 类型友好、可调试、不误伤、按需引入。`@ant-design/compatible` 作为 R3/Tabs 的兜底备选 |
| **B. DatePicker moment→dayjs(含 `moment.tz`)** | **B1+ 时区感知边界转换**:垫片接受/返回 moment(含 tz),加载 dayjs `utc`/`timezone` 插件做 tz 感知互转(保留 `moment` 为 peerDep) | B2 基于 `rc-picker` + momentGenerateConfig 的原生 moment DatePicker | 业务确认在用 `moment.tz`(§11 Q2),故 B1 必须升级为 tz 感知。若 antd5 DatePicker 对 dayjs.tz 保真度不足,回退 B2 |
| **C. 执行节奏** | C1 分阶段(Layer 0→1→2 各自验证) | C2 一次性 big-bang | C1 每阶段可独立灰度,回退成本低 |
| **D. fork 退役** | D1 先搬 `legacy/` 归档、确认无引用后下版本删 | D2 直接删 | D1 保留回退,符合「无损」精神 |
| **E. CSS 策略** | token 优先 + 开 cssVar + 极少量注入式全局 CSS(仅 token 表达不了的,如 `.gm-modal-footer`) | 全局 CSS 注入为主 | 贴合 antd5 设计哲学,避免优先级大战 |

### 5.1 决策 B 细节:DatePicker 边界转换

垫片 DatePicker 需互转的 moment 入口点(均需测试覆盖):
- `value` / `defaultValue` / `defaultPickerValue` / `pickerValue`(moment ↔ dayjs)
- `onChange(value, dateString)` / `onOk` 回调返回值(内部 dayjs → 外部 moment)
- `disabledDate(current)` 入参(外部期望 moment → 内部传 dayjs 时转换)
- `disabledTime`、`showTime`(含 `showTime.defaultValue` 的 moment)、`presets`、`cellRender` 等若用到

实现:封装 `momentToDayjs(m)` / `dayjsToMoment(d)` 两个纯函数,在垫片入参/出参边界统一转换。
**因业务确认使用 `moment.tz`(见 §11 Q2 已确认),转换必须时区感知**:加载 dayjs 的 `utc` + `timezone` 插件,`momentToDayjs` 用 `dayjs.tz(m.valueOf(), tz)` 保留时区,`dayjsToMoment` 用 `moment.tz(d.valueOf(), tz)` 还原,`tz` 取自原 moment 的 `$x`/`_z` 或显式传入。

**关键边界(易错,务必覆盖)**:
- **RangePicker 元组含 `null`**:选择中途值形如 `[Dayjs|null, Dayjs|null]`,不能对整个元组无脑 `dayjsToMoment`,必须 null-aware 逐项转换。当前 `DateFilter.tsx` 的 RangePicker 类型错误正源于此。
- **`format` token 假定**:moment/dayjs 的常见 token(`YYYY-MM-DD` 等)恰好重叠,直接透传 `format` 可工作;但 locale 相关/自定义 token 可能渲染不同。垫片**透传 `format` 不改写**,并文档化此假定。
- **locale 走不同通道**:moment 的 `moment.locale('ja')` **不会**让 antd 5 DatePicker 渲染日文——antd 5 的 locale 来自 `ConfigProvider` 的 `locale` prop,与 dayjs 的 locale 无关。若业务依赖 DatePicker 文案本地化,必须经 ConfigProvider 传入(本方案 `gmZhCN` 已覆盖中文;其他语种见 Q3)。
- **时区(`moment.tz`)—— 已确认业务在用**:见上「实现」段的 tz 感知转换。**残余风险**:antd 5 DatePicker 对 dayjs.tz 的显示支持有限,部分场景(如 `disabledDate` 跨时区判定、`presets`)可能漂移;若 tz 保真度不达标,回退决策 B2(基于 `rc-picker` + momentGenerateConfig 的原生 moment DatePicker)。见 R3。

## 6. 导出策略

```ts
// src/index.ts
// 1. re-export antd 5。注意:对「有垫片」的组件名,需按 §1A 决策做过滤式再导出
//    (export * from './compat/antd-reexport') 或模块增强,使垫片组件的类型也被加宽。
//    下面为示意,实现时按 §1A 落地类型层兼容。
export * from 'antd';

// 2. 兼容垫片(同名覆盖,接受 v4 API)——全吸收 breaking changes
export { default as Modal } from './compat/Modal';
export { default as Drawer } from './compat/Drawer';
export { default as Tooltip } from './compat/Tooltip';
export { default as Popover } from './compat/Popover';
export { default as Dropdown } from './compat/Dropdown';
export { default as Popconfirm } from './compat/Popconfirm';
export { default as Select } from './compat/Select';        // 同时承载 GM 全选/筛选删除增强
export { default as Cascader } from './compat/Cascader';
export { default as DatePicker } from './compat/DatePicker'; // 同时承载 moment 边界转换
export { default as TreeSelect } from './compat/TreeSelect';
export { default as Input } from './compat/Input';
export { default as InputNumber } from './compat/InputNumber';
export { message } from './compat/message';

// 3. GM 增强组件(同名覆盖)
export { default as Button } from './button';
export { default as Table } from './table';

// 4. 自定义组件
export { default as Icon } from './icon';
export { default as Sortable } from './sortable';
export { default as ContentWrapper, ContentWrapperContext } from './content-wrapper';
export { default as TableFilter, TableFilterContext, SearchBarContext } from './table-filter';
export type { FieldItem, TableFilterProps } from './table-filter';
export { default as TablePagination, TABLE_PAGINATION_HEIGHT } from './table-pagination';

// 5. Table hooks
export { default as useTableExpandable } from './table/hooks/useTableExpandable';
export { default as useTableResizable } from './table/hooks/useTableResizable';
export { default as useTableTheme } from './table/hooks/useTableTheme';
export { default as useTableDIY } from './table/hooks/useTableDIY';
export { default as useTableSelection } from './table/hooks/useTableSelection';
export { default as useTableVirtual } from './table/hooks/useTableVirtual';

// 6. Locale / 样式
export { default as gmZhCN } from './locale/zh_CN';
export { default as useGMLocale } from './locale-adapter/useGMLocale';
export { default as gmTheme } from './styles/theme';
export { GMGlobalStyle } from './styles/global';

export const version = '2.0.0';
```

> **Select/DatePicker 垫片与 GM 增强的关系**:`compat/Select` 在 BaseSelect 兼容垫片之上再叠加 GM 全选/筛选删除逻辑(即把现有 `src/select` 的增强并入垫片);`compat/DatePicker` 在边界转换之上无额外增强。gm-antd **内部**组件(如 table-filter 的 DateFilter)直接 `import { DatePicker } from 'antd'` 拿原生 v5 dayjs 版,不走垫片,避免 moment 转换冲突。

## 7. 风险与缓解

| # | 风险 | 影响 | 缓解 |
|---|------|------|------|
| **R1** | **rc-* / antd 提升歧义(最高危)**:yarn classic 不保证 antd 5 提升到顶层;~30 个旧版 `rc-*` 直接依赖被提升后污染 antd 5 内部 `require` | **编译通过但运行时崩溃**,难定位 | Layer 0.1 加 `resolutions` + Layer 0.2 移除旧 rc-*;Layer 0.5 用 `npm ls antd` / `duplicate-package-checker` 校验 |
| R2 | DatePicker moment 边界转换遗漏入口点(RangePicker 含 null 元组) | 日期类业务静默错值 | 列全转换点(§5.1),null-aware 元组转换,单测覆盖 |
| R3 | 业务用到 `moment.tz` / 自定义 moment 插件 | 时区转换失真 | 调研业务实际用法;必要时保留 moment 为运行时唯一真相(见决策 B 备选) |
| R4 | `Tabs.TabPane` / `Menu.Item` children→items 转换 | v5 **仅警告、仍渲染**(v6 才移除),业务页不破坏,但有控制台噪音 | 三选一:(a) 引 `@ant-design/compatible`;(b) 接受为唯一业务侧改动;(c) 写 children→items 运行时垫片。**需业务确认是否用到(Q1)** |
| R5 | **cssVar 作用域 + portal**:13 处内联 `var(--ant-color-primary)` 中部分在 `createPortal(..., document.body)` 渲染的内容里,落在 ConfigProvider 子树外 → 变量解析为 `undefined`(内联样式无 fallback) | portal 内主色丢失 | **portal-rewrap 与 cssVar 必须同批落地**:useTableDIY portal 内包 `<ConfigProvider>` 后,cssVar 才对 portal 内容生效 |
| R6 | 双 antd 共存:Layer 0 后 bisheng-plugin 内部仍嵌套 antd 4 | 若有代码 require('antd') 走到嵌套那份则版本错乱 | Layer 2 退役 bisheng 彻底消除;Layer 0.5 即用 `duplicate-package-checker` 确认 |
| R7 | 注入式全局 `.ant-*` 与 antd5 CSS-in-JS 抢优先级 | 视觉偶发不一致 | token 优先 + cssVar;逐组件视觉验证 |
| R8 | 垫片覆盖面遗漏某项 v4→v5 breaking change | 业务侧静默失效 | 对照 antd 官方迁移指南逐项核对,补全矩阵 |
| R9 | React 17 下 antd 5 警告(具体为 `findDOMNode` 弃用警告、缺并发模式安全保证) | 控制台噪音 | 可接受;若阻断则评估 React 18 升级(超出本方案范围) |

## 8. 验证策略

### 8.1 构建与类型
- `tsc -p tsconfig.build.json` 0 错误
- `npm run build:wrapper` 产出 `dist/`(`index.mjs`/`index.cjs`/`index.d.ts`)
- `npx tsc --noEmit` 对 dumi demo 无错

### 8.2 文档站
- `npm run doc:dev` 起 dumi,所有 demo 渲染正常(table hooks / table-filter / DatePicker / Select 全选)

### 8.3 业务项目冒烟(无损验证的核心)
选 1 个真实业务项目,换上新 gm-antd,**不改一行业务代码**,冒烟核心场景:
- Modal/Drawer 开关(`visible` 旧用法应仍生效)
- Select 全选 / 筛选删除 / dropdown 自定义
- DatePicker 取值(业务传 moment 应正常)
- Tabs / Menu(确认是否用 `Tabs.TabPane` / `Menu.Item` children 写法,见 R4)
- Table 各 hook(DIY / 批量选择 / 虚拟滚动 / 可调列宽 / 主题 / 展开)
- message.warn 调用

### 8.4 视觉对照
对照旧 antd 4 截图,确认主色(#0363ff)、表格行高、选中行色、Modal footer 定位等关键视觉一致(允许 token 近似,不追求像素级,除非另行要求)。

## 9. 工作量估算

| 层 | 内容 | 预估 |
|----|------|------|
| Layer 0 | resolutions + 移除 rc-* + 重装 + tsup + 校验提升 | 1 天 |
| Layer 1A | 兼容垫片层(Modal/Drawer/Tooltip/Popover/Dropdown/Popconfirm/Select系/Input系/message/Tabs/Menu + **DatePicker 边界转换含 RangePicker**);其中 DatePicker 单独约 1.5-2 天 | 3-3.5 天 |
| Layer 1B | 残留 v5 问题修复(深路径/portal+cssVar/CSS/滚动锁/真实 src bug/demo 7 处) | 1.5 天 |
| Layer 2 | 退役 components/ fork + bisheng 工具链 + 配置清理 | 1 天 |
| 验证 | 构建类型 + dumi + 业务项目冒烟 + 视觉对照 | 1 天 |
| **合计** | | **约 7-8 人天** |

> 估算较初版上调:Layer 1A 的 DatePicker 边界转换(RangePicker null 元组 + locale 通道 + showTime)实测工作量高于"中-难";Layer 1B 含 ~12 个真实 src bug 修复,非免费版本红利。

## 10. 交付物

1. `src/compat/` 兼容垫片层
2. 残留 v5 问题修复(跨多个既有文件)
3. `legacy/components/` 归档 + `package.json`/配置瘦身
4. 本设计文档定稿 + 实现计划(writing-plans 产出)
5. 业务项目无损升级验证报告

## 11. 业务确认事项(已回答)

> 业务侧已确认三项「都在用」,均纳入垫片范围:

- **Q1 ✅ 在用**:`Tabs.TabPane` 与 `Menu.Item` children 写法都有用 → **Tabs/Menu 垫片必做**(矩阵已列,采用 children→items 运行时转换;`@ant-design/compatible` 作为兜底)。
- **Q2 ✅ 在用**:DatePicker 用到 `moment.tz` → 决策 B 升级为**时区感知边界转换**(B1+);若 antd5 DatePicker 对 dayjs.tz 保真度不足则回退 B2(见 R3)。
- **Q3 ✅ 在用**:业务还用到其他 antd v4 特殊 API / 已移除组件(如 `Comment`/`PageHeader`/`BackTop` 等)。**具体清单需在 Layer 1A 起始时对业务代码做一次 grep 审计**;审计出的已移除组件优先用 `@ant-design/compatible` 或 pro-components 再导出兜底,语义变更项逐个加垫片。
