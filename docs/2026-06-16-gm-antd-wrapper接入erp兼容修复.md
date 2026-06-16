# gm-antd(antd5 wrapper) 接入 erp 兼容性修复

> 创建日期：2026-06-16
> 关联：非 TAPD 需求，为「把 feature/wrapper-layer 分支的 gm-antd link 进 gm_static_x_erp 联调」过程中发现的 antd4→5 迁移兼容性 bug 集合。承接 [2026-06-15 antd5 无损升级](./2026-06-15-antd5-lossless-upgrade.md)。

## 需求概述

把 gm-antd 的 antd5 wrapper 层 link 进 erp（`gm_static_x_erp`）做真实联调，验证 wrapper 在宿主应用里的表现。联调中发现并修复了一系列 antd4 fork → antd5 wrapper 的兼容性回归：样式丢失、组件增强丢失、locale/dayjs/moment、表格空行等。

## 联调接入方式（注意事项）

erp 通过 `antd` 别名消费 gm-antd（`"antd": gm-antd tgz`）。link 本地 wrapper 的正确做法（踩坑后总结）：

1. **antd symlink**：`erp/node_modules/antd` → 本地 gm-antd（不能 yarn link，因为别名是 `antd` 不是 `gm-antd`）。
2. **react 交叉链接**：gm-antd 内部 `node_modules/{react,react-dom}` → erp 的 react 18。否则 gm-antd 用自己的 react17、erp 用 react18 → 双 React 实例 → `Invalid hook call`。
3. **watch 构建**：gm-antd 跑 `build:wrapper:watch`，erp 读 `dist/`。
4. **tsup watch 不能 clean**（见 Bug#4），否则重建擦 dist 的瞬间 erp 解析 `antd` 失败、污染 webpack 持久化缓存。

> 宿主消费 wrapper 的两个必做项（erp 迁移时落地）：① `import 'antd/dist/index.css'`（wrapper 组件静态样式，antd5 基础组件走 cssinjs 运行时注入）；② `ConfigProvider theme={gmTheme}`（GM 主色 #0363ff）。

## Bug 修复记录

### 2026-06-16 · Bug#1 TableFilter 多选 select 增强丢失

- 现象：order_audit 客户下拉没有「已选中/未选中/全选」增强，退化成 antd 默认菜单；`isRenderDefaultBottom` prop 泄漏到 DOM。
- 根因：`SelectFilter` 用 `import { Select } from 'antd'`，在 gm-antd 内部解析到**真实 antd5 Select**（无 GmSelect 增强），而非 compat 增强 Select。
- 修复：`src/table-filter/components/SelectFilter.tsx` 改 `import Select from '../../compat/Select'`。
- 验证：下拉出现「未选中」分区 +「全选」底部，泄漏警告消失。

### 2026-06-16 · Bug#2 重置按钮(second 型)文字变黑

- 现象：TableFilter 重置按钮文字黑色，应为 GM 主色。
- 根因：`secondButtonStyle.color = var(--ant-color-primary)`，但 gmTheme **关闭了 cssVar**，变量未注入 → 无 fallback → 回退黑色。
- 修复：`src/button/styles.ts` 加 fallback `var(--ant-color-primary, #0363ff)`（与 global.ts 同款写法）。
- 验证：dumi + erp 实测文字 `rgb(3,99,255)`。

### 2026-06-16 · Bug#3 禁用按钮 hover 后背景消失

- 现象：批量审核(disabled)鼠标 hover 后背景变透明。
- 根因：`GmButton.onMouseLeave` 有个错误分支，disabled 时把 bg 设成 `transparent`。
- 修复：`src/button/GmButton.tsx` 删掉该分支（disabled 保持 #f5f5f5）。
- 验证：disabled 按钮 hover+leave 全程 `rgb(245,245,245)`。

### 2026-06-16 · Bug#4 tsup watch 重建擦 dist 污染 erp webpack 缓存

- 现象：gm-antd 改源码后 erp 页面崩，报 `antd module has no exports` / `Can't resolve './components' in gm-antd/index.js`，reload 不恢复。
- 根因：tsup `clean: true` 在 watch 重建时先擦空 dist，erp webpack 恰在那瞬间解析 `antd`，dist/index.js 缺失 → 回退到 gm-antd 根 `index.js`（旧 antd4 入口）→ 写进 erp 的 webpack 持久化缓存（3.7G）。
- 修复：`tsup.config.ts` 改函数形式 `clean: !options.watch`（watch 不擦、正式构建仍 clean）。并清掉 erp `node_modules/.cache` + 重启 dev server 恢复。
- 教训：link 场景下被消费方的构建不能有「产物短暂缺失」窗口。

### 2026-06-16 · Bug#5 DatePicker 日历显示英文(星期/月份)

- 现象：DatePicker 下拉星期显示 `Su Mo Tu`、月份 `Feb`，应为中文。
- 根因：antd5 zhCN locale **不带 shortWeekDays**，rc-picker 回退到 dayjs `weekdaysMin()`；dayjs 默认 en。且 erp 的 dayjs 与 gm-antd/rc-picker 的 dayjs 是**不同实例**，erp 注册 zh-cn 无效。
- 修复：`src/index.ts` 注册 `import 'dayjs/locale/zh-cn'`（在 gm-antd 这个与 rc-picker 共享的实例上注册）。
- 验证：星期「一二三四五六日」、月份「2026年6月」。
- 注意：gmZhCN(antd locale) 修不了星期，必须 dayjs locale。

### 2026-06-16 · Bug#6 DatePicker 日历日期乱码(跳到 2031-2035)

- 现象：领料页日期日历格子乱跳（跨 2031-2035 年）、选中时间与实际不符。
- 根因：erp 是 moment 体系，字段值是 **moment 对象**；gm-antd 的 antd5 DatePicker/rc-picker 只认 **dayjs**。DateFilter 直接把 moment 塞给 dayjs picker → rc-picker 当 dayjs 操作 → 日期运算全崩。
- 修复：`src/table-filter/components/DateFilter.tsx` 在边界做转换（用现成的 `compat/dateUtils.ts`，之前没用上）：value `moment→dayjs` 给 picker、onChange `dayjs→moment` 存回 store，**保持 erp moment 契约不变**。
- 验证：日历恢复「2026年6月」、1-30 顺序、title `2026-06-01`...
- 同类隐患：gm-antd 其他直接用 antd5 日期组件又可能收 moment 的地方（compat/DatePicker 等）需同样排查。

### 2026-06-16 · Bug#7 Table 表格顶部空白行

- 现象：领料页表格数据行上方多一行空白行（搜出多行数据才出现）。
- 根因：antd5 的 `.ant-table-measure-row`（测列宽隐藏行）应被 `.ant-table-measure-cell-content { height:0 }` 塌成 0 隐藏，但 antd5 cssinjs 用 `:where()` 零优先级，被宿主 CSS 覆盖 → measure-cell 撑到满行高 48px → 露成空白行。
- 修复：`src/table/styles/table-hooks.css` 强制 measure-row/cell/content `height:0 !important`。
- 验证：measure-row 0px，8 行数据正常渲染。

### 2026-06-16 · Bug#8(erp 侧) TableFilter 字段宽度过窄

- 现象：领料页 tableFilter 字段只有 232px，右侧大量留白。
- 根因：erp `@/common/components/table_filter/index.less` 遗留 `.table-filter { display:flex; flex-wrap:wrap }`（旧 flex 布局组件的 CSS，组件已废弃、默认导出已是 gm-antd 的 TableFilter），让 gm-antd 的 `<Row>` 作为 flex 子项收缩成一半宽。
- 修复：erp 侧移除该 `display:flex`（gm-antd 的 Row/Col 自己管布局）。
- 验证：Row 927→1864px，字段 232→469px。

## 改动清单

**gm-antd（真修复，已纳入 feature/wrapper-layer）：**
- `src/table-filter/components/SelectFilter.tsx`（Bug#1）
- `src/button/styles.ts`（Bug#2）
- `src/button/GmButton.tsx`（Bug#3）
- `tsup.config.ts`（Bug#4）
- `src/index.ts`（Bug#5）
- `src/table-filter/components/DateFilter.tsx`（Bug#6）
- `src/table/styles/table-hooks.css`（Bug#7）

**erp（接入/迁移项，gm_static_x_erp）：**
- `src/index.tsx`：`import 'antd/dist/index.css'` + `gmTheme` + `gmZhCN` + dayjs locale
- `src/css/index.less`：注释 antd4 `antd.variable.min.css`
- `src/common/components/table_filter/index.less`：移除遗留 `display:flex`（Bug#8）

## 反复出现的根因模式（迁移要点）

1. **antd5 `:where()` 零优先级**：宿主全局 CSS 会压过 antd5 组件样式（measure-row 空白行、边框透明等），gm-antd 需要在自己的 CSS 里用足够优先级兜底。
2. **gm-antd 内部 `from 'antd'` 解析到真实 antd5**：需要增强的内部组件应直接 import compat 版本（SelectFilter 已修，CascaderFilter 等待排查）。
3. **dayjs 实例一致性**：gm-antd 与 rc-picker 共享 dayjs，locale/插件注册要在 gm-antd 这边做；erp 自己 import 的 dayjs 是另一个实例。
4. **moment↔dayjs 边界转换**：erp(moment) ↔ antd5(dayjs)，转换必须在 gm-antd 桥接层（DateFilter 已修）。
