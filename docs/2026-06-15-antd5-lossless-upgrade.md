# gm-antd antd5 无损升级

> 创建日期：2026-06-15
> 关联文档：[设计 spec](./superpowers/specs/2026-06-12-antd5-lossless-upgrade-design.md) · [实现 plan](./superpowers/plans/2026-06-12-antd5-lossless-upgrade.md)
> commit：`42e87433e` (feature/wrapper-layer)

## 需求概述

让 gm-antd 真正跑在 antd 5 上(从 antd 4.24.10 升到 5.29.3),并通过对业务侧零改动的方式全吸收 antd 4→5 breaking changes。

核心问题:包装层迁移后,`package.json` 已声明 `antd: ^5.12.0`,但 `node_modules/antd` 顶层停留在 4.24.10(陈旧未随 package.json 刷新),`src/` 为 antd 5 写的代码加载到 antd 4 类型 → 22 个类型错误 + `tsup` 未安装无法构建。

## 前端实现

### 实现方案

三层架构执行(Layer 0 → 1 → 2,每层独立验证):

**Layer 0 — 解阻塞**
- `package.json` 加 `resolutions: { antd: ^5.12.0 }`,强制 yarn classic 把全树 antd 统一到 5.x(消除 antd 4/5 提升歧义)
- 删除 32 个 antd5 已自带的 `rc-*` 直接依赖(顶层旧版会污染 antd5 内部 `require('rc-*')`)
- `rm -rf node_modules yarn.lock && yarn install`,让 resolutions 与 rc-* 移除生效

**Layer 1A — `src/compat/` 兼容垫片层(25 文件)**
薄 `forwardRef` 包装,接收 v4 props 翻译为 v5,从 `src/index.ts` 同名覆盖 `export * from 'antd'`:
- 通用工具:`withCompat`(`applyCompatProps` 纯函数 + `withCompat` forwardRef 包装)、`withBaseSelectCompat`(`BASE_SELECT_RENAME` + `transformBordered`)
- visible→open 系:Modal/Drawer(+ `destroyOnClose`→`destroyOnHidden`)/Tooltip/Popover/Dropdown/Popconfirm
- bordered→variant 系:Input(保留 TextArea/Search/Password/Group 静态成员)/InputNumber
- BaseSelect 系:Cascader/TreeSelect(`SHOW_ALL/PARENT/CHILD`)/AutoComplete/Mentions
- Select:并入 GmSelect 全选/筛选删除增强,移除 useCallback
- message:`warn` 别名(v4 `message.warn` === v5 `message.warning`)
- Tabs/Menu:`children`→`items` 运行时转换(`childrenToItems` 工具)
- DatePicker:moment↔dayjs 时区感知边界转换(`dateUtils`,epoch ms 取值 + tz 还原显示)

**Layer 1B — 残留 v5 修复**
- `useTableDIY` 的 `createPortal` 内容包 `<ConfigProvider>`(theme/locale 生效)+ 移除手动 `document.body.style.overflow`
- 深路径 import 清理(`antd/es/theme/useToken`→`theme.useToken`、`rc-table/lib/interface`→`antd` 等)
- `gmTheme` 开 `cssVar` + `global.ts` 选中行色改 token 变量(`var(--ant-color-primary-bg, #c3daff)`)
- `useTableTheme` `className.includes` 脆弱判定加固(加 `data-placeholder`/`colSpan===0` 兜底)
- 22 个 src 真实类型 bug 修复(tsc src 归零)

**Layer 2 — 退役 antd4 fork**
- `components/` `git mv` 到 `legacy/components/` + 打 tag `legacy/antd4-fork`
- 移除 bisheng/@ant-design/tools/antd-img-crop 等 7 个旧文档工具 devDep + 相关 scripts
- 根 tsconfig 删 `antd`→`components` 别名、`.dumirc` 删临时 alias

**Layer 3 — TableFilter 布局栅格化改造(2026-06-16)**

`src/table-filter/index.tsx` 字段布局从 flex 自适应改为 antd 栅格(Row/Col):
- 字段统一 `Col span={colSpan}`,新增 `TableFilterProps.colSpan` prop(默认 6,一行 4 列)供外部控制宽度;range/自定义 render 字段与普通字段等宽
- `Row gutter={[12.5, 12.5]}` 控制行列间距(替代旧 flex `gap`)
- 移除 `ResizeObserver` + `width`/`flex`/`fieldWidth`/`FIELD_MIN_WIDTH` 自适应计算(栅格天然响应容器宽度)
- 操作区(设置图标/重置/搜索)从 `Col flex="auto" + justify-end`(置右)改为 `Col span={colSpan}` 流式跟随字段排列
- `.labeled` 加 `box-sizing: border-box`(项目未 import antd reset.css,默认 content-box;`.labeled{width:100%}+border` 会溢出 Col 的 gutter padding 吃掉间距——见 Bug 修复记录)

### 关键设计决策

1. **显式 export 覆盖机制**:利用 TS 规则「`export *` 与同名显式 `export` 冲突时显式胜出」。`src/index.ts` 先 `export * from 'antd'`,再对垫片组件显式导出**值** + **加宽后的 props 类型**(V4 ∪ V5)。业务 `import { Select, SelectProps } from 'gm-antd'` 类型与运行时都接受 v4 API。经 `dist/index.d.ts` 验证覆盖生效。

2. **DatePicker 时区保真(决策 B1+)**:`dateUtils` 用 `valueOf()`(epoch ms)做 moment↔dayjs 互转,**绝对时刻不丢**;时区名通过 `_z.name`(moment-timezone)/`$x.$timezone`(dayjs)互还原,**显示时区不丢**。RangePicker 选择中途值 `[Dayjs|null, Dayjs|null]` 做 null-aware 逐项转换。单测覆盖 round-trip + Asia/Tokyo + null 元组。

3. **移除 select 模块全部 useCallback**(全局规则):GmSelect/DropdownRender/useSelectAll/useFilterDeleted 的 `useCallback` 改普通函数(`useMemo` 保留,规则不禁)。

### 注意事项

- **`tsconfig.build.json` 需补 `lib:["dom","es2018"]` + `types:["node"]`**(plan 盲区):build.json 缺 lib 导致 ~60 个 `Array.includes`/`Object.values`/`Promise.finally` 噪音;坏 `@types/minimatch` stub(经 `bisheng → webpack-dev-server → del → @types/glob` 传递,`"main":""` 无 .d.ts)报 TS2688,用 `types:["node"]` 显式限定排除。
- **dts 生成从 rollup-plugin-dts 改为 `tsc --emitDeclarationOnly`**:tsup 内置 rollup-plugin-dts 对 antd5 复杂泛型有系统性 bug(`CascaderProps` 多泛型 TS2314、`MentionsProps` 深继承 TS2724、Tabs ref TS2322)。`build:wrapper` 改为 `tsup && (tsc --emitDeclarationOnly -p tsconfig.build.json; test -f dist/index.d.ts)`。
- **5 处深路径保留**(全带注释,antd5 公共入口无替代):`antd/lib/date-picker`(RangePickerProps)、`antd/es/select`(BaseOptionType/DefaultOptionType)、`antd/es/locale`×2(Locale 类型)、`antd/es/table/interface`(table 类型)。
- **Cascader/Mentions 用 `React.ComponentProps<typeof AntX>`**:绕过 rollup-plugin-dts 泛型 bug(运行时无影响,类型层失去自定义泛型,记入已知限制)。
- **jest 28→29 + ts-jest@^29 + jest.config.compat.js(.js 免 ts-node)**:旧 `.jest.js` 依赖已删的 `@ant-design/tools` codePreprocessor,新建轻量 ts-jest 配置只跑 `src/compat` 纯函数单测。

### 已知限制

- **`node_modules/@gm-common/tool` 8 个 tsc 错误**:该包以纯 .ts 源码发布无 .d.ts(`main`/`types` 指向 `src/index.ts`),是其固有质量问题(md5 never 推断、`__wxjs_environment`、`__NAME__`),与 antd 升级无关。建议该包改用 .d.ts 发布。
- **Modal/Drawer `onVisibleChange`→`afterOpenChange` 时机差异**:antd5 **完全移除** onVisibleChange(仅剩 afterOpenChange,经源码验证非 reviewer 误判的 deprecated alias)。垫片只能改名,时机从"visible 变化瞬间"变"开/关动画完成后"(约 300ms 延迟)。这是 antd5 inherent breaking,业务依赖 onVisibleChange 即时副作用(如关闭即重置表单)需自行评估。
- **`message.warn` 类型层不可见**:运行时生效(re-export message 单例 + 挂 warn),TS 需用 `message.warning`。
- **GmSelect 强制 `showSearch` + 不透传 children**:原 GmSelect 设计(GM 增强需搜索能力,走 options API)。children 形式有 dev `console.warn`。

## 联调记录

### 2026-06-15

- 联调对象:dumi 文档站(dev server,http://localhost:8000)
- 状态:已完成(文档站层)
- 验证结果:
  - 首页 + 组件导航(Button/Select/ContentWrapper/Table 等)+ Table demo(张三/李四/王五表格)渲染正常
  - 控制台无 v4 弃用警告(仅 `[webpack] connected` HMR + 2 个 a11y `form field should have id/name` 提示,非致命)
  - Webpack 编译成功(4774 modules),`parse value fail` 为 css-in-js 解析噪音
- ✅ 已完成(文档站层):TableFilter 交互验证 demo + compat 垫片 16 个组件文档页(详见下方「compat 文档化」记录)
- 待补充:业务项目零改动换包冒烟

### 2026-06-15(compat 文档化)

- 范围:为 compat 垫片层全部 16 个组件补 dumi 文档页 + demo,验证 antd5 兼容 & 样式渲染
- 新增「兼容垫片(antd4→5)」侧边栏分组,16 个组件页全部 HTTP 200、渲染正常
- 验证截图(TableFilter + 6 个代表组件 Modal/DatePicker/Tabs/Menu/Input/Select)均无 v4 弃用警告、无渲染报错
- 每个 demo 证明三件事:v4 API 可用(垫片翻译生效)、样式正常、显示在文档侧边栏
- TableFilter demo 重写为真实 `<TableFilter>`(input/select多选/cascader/date单选/RangePicker),底部 `<pre>` 展示 onSearch params,验证 date 类字段取值为 epoch ms
- 同时清理 TableFilter 残留:`Labeled.tsx`/`CascaderFilter.tsx` 2 处 v4 弃用 prop 改名、`index.tsx` 删除 remount key bug
- 已知限制(已诚实写入对应文档):Modal/Drawer `onVisibleChange` 时机差(antd5 inherent);`message.warn` 仅运行时生效 TS 不可见;DatePicker moment↔dayjs 边界转换

### 2026-06-16(dumi 全量验证 + 样式回归修复)

- 联调对象:dumi 文档站(http://localhost:8000),headless chrome 截图逐页验证
- 状态:已完成
- 验证范围:TableFilter + 16 个 compat 组件页全部 HTTP 200、渲染正常、控制台无 v4 弃用警告
- 暴露并修复 4 个样式/功能回归(详见下方「Bug 修复记录」2026-06-16):
  1. TableFilter 样式整体丢失(label/组件换行、无边框、按钮错位)
  2. TableFilter cascader/select 没铺满宽度
  3. TableFilter 搜索按钮文字为空(`useGMLocale` 浅合并覆盖 GM 文案)
  4. useTableVirtual 表头变白底(antd5 token 与 antd4 `#fafafa` 不一致)
- 关键认知:**antd4→antd5 迁移时,多个组件的 `index.less` 样式文件被整体丢弃**(table-filter、useTableVirtual 等在 main 分支有 less,迁移后没有),导致布局/边框/背景色回归。修复方式是从 main 恢复样式并做 antd5 适配(CSS 变量改名 `var(--ant-primary-color)`→`var(--ant-color-primary, fallback)`,类名适配)

## Bug 修复记录

### 2026-06-15(code-review 阶段)

- **useCallback 残留(全局规则)**:`CascaderFilter`(refreshSyncOptions)、`GmButton`(getSecondStyle/handleClick)未清理 → 改普通函数
- **Modal/Drawer onVisibleChange 时机**:reviewer 误判 antd5 保留 deprecated alias,实际 `grep` 确认已完全移除 → 加注释说明时机差异(antd5 inherent,无法消除)
- **GmSelect 冗余 handleSearch**:仅转发 onSearch 的中间函数 → 直接 `onSearch={onSearch}`;showSearch/children 加注释 + dev warning(保留原设计)
- **transformBordered 非纯函数**:直接 mutate 入参 → 改浅拷贝纯函数
- **SelectFilter v4 prop warning**:`dropdownMatchSelectWidth`→`popupMatchSelectWidth`、`onDropdownVisibleChange`→`onOpenChange`

### 2026-06-15(实现阶段)

- **bigint 索引(TS2538)6 处**:`getColumnKey` 返回 `string | React.Key`,React.Key 推断含 bigint → 改返回 `string | undefined` + `String(key)` 转换
- **Resizable/VariableSizeList JSX component(TS2786)**:@types/react 18 refs 不兼容 → `as unknown as React.FC` + 注释(第三方库类型滞后)
- **onBlurCapture(CascaderFilter/SelectFilter)**:antd5 类型移除 → 外层包 `<div onBlurCapture>` 保留 capture 行为
- **demo 签名漂移 5 处**:`use-table-selection/theme/virtual` demos 对齐 hook 真实签名
- **TreeSelect 静态成员命名**:plan 笔误 `ShowAll` → antd4/5 实际为 `SHOW_ALL`(全大写)
- **Select/DatePicker 类型深路径**:`BaseOptionType`/`DefaultOptionType`/`RangePickerProps` 在 antd5 公共入口不导出 → 保留深路径 + 注释

### 2026-06-16(dumi 验证暴露的样式回归)

- **TableFilter 样式整体丢失(label/组件换行、无边框、按钮错位)**
  - 根因:antd4→antd5 迁移时 `components/table-filter/index.less` 整个文件被丢弃(main 分支有,迁移分支没有),`index.tsx` 的 `import './index.less'` 也删了
  - 修复:新增 `src/table-filter/index.css`(从 main 分支 less 恢复,做 antd5 适配:`var(--ant-primary-color)`→`var(--ant-color-primary, #1677ff)` 加 fallback,因项目未开 cssVar),`index.tsx` import 接回。还原 `.labeled`(inline-flex + border + 34px 高,label 与组件同行)、`.filter-btn-icon`(方形设置按钮)、`.labeled-focused`(主色聚焦发光)
- **TableFilter cascader/select 没铺满宽度**
  - 根因:`CascaderFilter.tsx`/`SelectFilter.tsx` 的 `onBlurCapture` 包裹 `<div>` 没设 width,antd5 下内部 Select/Cascader 的 `width:100%` 相对这个窄 div 失效(antd4 下靠内部默认 display 撑开,antd5 行为变了)
  - 修复:两个组件的包裹 div 加 `style={{ width: '100%' }}`
- **TableFilter 搜索按钮文字为空(看似按钮不显示)**
  - 根因:`useGMLocale` 的浅合并 `{...zhCN, ...locale}` 让 antd 的 `locale.Table`(无 `search` 字段)整体覆盖 GM 增强的 `zhCN.Table`(有 `search:'查询'`),导致 `tableLocale.search` 为 undefined → 搜索按钮渲染但文字空
  - 修复:`useGMLocale.ts` 对 `Table`/`Upload` 等 GM 扩展过的子对象做深合并(GM 自定义字段优先,antd locale 字段次之)。**这是全局 bug**,不只影响 table-filter,任何用 `useGMLocale().Table.search/pleaseSelect/pleaseEnter` 的地方都受影响
- **useTableVirtual 表头变白底**
  - 根因:`TableContainer.tsx` 表头背景色用 antd5 token `colorFillQuaternary`(默认近白色),旧版 antd4 表头是 `#fafafa` 灰底,导致表头与表体区分不明显
  - 修复:表头背景色从 `token.colorFillQuaternary` 改回 `#fafafa`(还原旧版观感,不依赖 antd5 token),同步移除不再使用的 `colorFillQuaternary` 类型声明(noUnusedLocals)
- **TableFilter 栅格化后字段间距(gutter)看似失效**
  - 根因:栅格化后 `.labeled` 设 `width: 100%`,但项目**未 import antd reset.css、无全局 `box-sizing: border-box`**,`.labeled` 默认 content-box → `width:100%` + `border:1px` 使实际宽度溢出 Col 的 gutter padding(padding-left/right 6.25px),吃掉相邻字段间距,视觉上字段连成一片、gutter 失效
  - 修复:`.labeled` 显式加 `box-sizing: border-box`,width:100% 含 border,不再溢出吃掉 gutter 间距。CDP 实测确认 gutter 的 Col padding 机制本身正常(padL/padR=6.25px),问题只在内容溢出

## ERP 接入验证(2026-06-15)

> 在 gm_static_x_erp 用 symlink 接入升级版 gm-antd(antd5)验证(`yarn start:lite`)。**结论:gm-antd 升级核心正确,但 ERP 接入 antd5 是独立专项工程,当前不可零改动直接接入。** 验证后已回退(恢复 antd4 fork + CSS)。

### 接入方式
- gm-antd `npm run build:wrapper`(CJS) → ERP `node_modules/antd` symlink → gm-antd
- 验证完毕已回退:`rm node_modules/antd && mv node_modules/antd.bak node_modules/antd` + 恢复 CSS

### 暴露的接入障碍清单

**gm-antd 侧(本次已修)**
- ESM fully-specified(webpack5 对 .mjs 严格解析,gm-antd ESM bundle external import 无扩展名)→ tsup 临时改 `format:['cjs']`、package.json 去 `module` 字段。后续优化 ESM(exports 字段 + bundle 策略)
- `useTable` 聚合 hook 迁移遗漏 → 已补 `src/table/hooks/useTable/index.tsx`(组合 DIY/Selection/Resizable/Theme/Virtual/Expandable)+ src/index 导出(ERP `import { useTable } from 'antd'` 依赖)

**gm-antd 侧(待诊断)**
- `withCompat(Popover)` 在 React16 运行时崩:`Unable to find node on an unmounted component`,栈 `Popover→Tooltip→Trigger→ResizeObserver→SingleObserver`。疑似 forwardRef + rc-trigger 旧版交互,需诊断是垫片问题还是 React16+antd5 Trigger 固有

**ERP 侧(专项升级时处理)**
- `ConfigProvider` 只传 `locale` 没传 `theme={gmTheme}` → antd5 用默认主题(非 GM),样式/配色不符
- 残留 antd4 less:`src/css/index.less` 的 `antd/dist/antd.variable.min.css` + `antd/lib/style/reset_*` + `reset_ant_design.less`(.ant-* 覆盖,与 antd5 cssinjs 的 `:where(.css-xxx)` 冲突)+ `tree_table.tsx` import `antd/es/table/hooks/useTableSelection/index.less`
- React 16.14 → antd5 cssinjs 降级 + findDOMNode 警告;建议升 React 17
- 旧版 rc-*(rc-notification/rc-trigger/rc-resize-observer)与 antd5 新版双版本(symlink 放大;发包 + ERP 升级 rc-* 后消除)
- v4 弃用 API:`bodyStyle`/`overlayInnerStyle`/`Tabs.TabPane` 等 deprecation warning
- mobx 多版本(symlink 副作用,gm-antd/node_modules/mobx vs ERP;发包后共用 ERP 的 mobx,无此问题)

### 验证里程碑
- ✅ ERP 编译通过(修 ESM/CSS/useTable 后,仅 rc-notification 2 warnings)
- ✅ 登录页 + 主框架(导航/顶栏)用 antd5 渲染正常
- 🔴 订单页 Popover/Tooltip 崩(ErrorBoundary 兜底)
- 🔴 样式错乱(ConfigProvider 缺 theme + 残留 antd4 less + react16 cssinjs)

### 正式升级建议(ERP 接入 antd5 专项)
1. ERP React 16→17(antd5 cssinjs 最佳支持 + 消 findDOMNode 警告)
2. ERP `ConfigProvider` 加 `theme={gmTheme}`(注入 GM 主题)
3. 清理 ERP 残留 antd4 less(reset_ant_design.less、index.less 的 antd4 import、tree_table 的 antd/es less),改用 antd5 cssinjs token 或 gm-antd 的 cssVar
4. ERP rc-* 对齐 antd5(或依赖 antd5 自带,删 ERP 直接 rc-* 依赖)
5. gm-antd 侧诊断 `withCompat(Popover)` 在 React16 的崩(发布前必修)
6. 清 ERP v4 弃用 API(bodyStyle→styles.body、Tabs.TabPane→items 等)

### 关键认知
- **symlink 接入放大双依赖问题**(mobx/rc-* 双版本),发包后 ERP 装 gm-antd 不会带 node_modules,这些问题消失
- gm-antd 升级(antd5 wrapper + compat 垫片 + useTable)本身是正确且可用的,ERP 接入障碍主要在 ERP 侧(React16/CSS/旧依赖)与 antd5 的适配

