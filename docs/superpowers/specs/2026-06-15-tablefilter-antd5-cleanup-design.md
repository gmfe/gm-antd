# TableFilter antd5 收尾清理 + 交互验证 demo

> 创建日期：2026-06-15
> 父文档：[antd5 无损升级](../../2026-06-15-antd5-lossless-upgrade.md) · [antd5 升级设计 spec](./2026-06-12-antd5-lossless-upgrade-design.md)
> 范围：`src/table-filter/` 组件

## 背景与现状

TableFilter 在 `1e6cab4bb feat(wrapper): migrate table-filter component (Phase 3)` 已迁移到 antd5，主体可用：

- `index.tsx`：`Popover` 用 `open`/`onOpenChange`
- `SelectFilter.tsx`：`variant="borderless"`、`popupMatchSelectWidth`、`onOpenChange`
- `DateFilter.tsx`：`variant="borderless"`、dayjs、`onOpenChange`
- `InputFilter.tsx` / `CascaderFilter.tsx`：`variant="borderless"`
- CSS token：`var(--ant-color-primary)`

但迁移没做干净，遗留 3 个问题，且文档（父文档 L80）明确 TableFilter 交互验证待补充。

## 问题清单

| # | 文件:行 | 问题 | 性质 |
|---|---------|------|------|
| 1 | `components/Labeled.tsx:60` | `dropdownMatchSelectWidth={false}` —— v4 弃用 prop，antd5 已重命名 | antd5 收尾 |
| 2 | `components/CascaderFilter.tsx:127` | `onDropdownVisibleChange={...}` —— v4 弃用 prop，antd5 已重命名 | antd5 收尾 |
| 3 | `index.tsx:230` | `key={store.loading ? Date.now().toString() : Date.now().toString()}` —— 两分支相同，key 每次 render 都变，搜索按钮每次渲染被 remount（性能浪费 + loading 转圈被打断） | bug |
| 4 | `demos/basic.tsx` | 假 demo：只循环渲染裸 `Input/Select`，没渲染 `<TableFilter>`，table-filter 在 dumi 文档站从未被真实跑过 | 验证缺失 |

## 范围界定

**In scope（本次做）**
- 修复问题 1/2/3
- 重写问题 4 的 demo，覆盖 input / select(多选+搜索+清空) / date 单选 / RangePicker / cascader / 搜索-重置-trigger 的真实交互

**Out of scope（明确不做）**
- **SelectFilter 不接入 compat 层的 GmSelect**：`SelectFilter.tsx` 继续用原生 antd5 `Select`。父文档 L80 提到的「全选/筛选删除」是 GmSelect 增强，原生 Select 不具备，当前 table-filter 里本就不存在该能力，本次不引入。
- moment→dayjs 已在 Phase 3 完成（`DateFilter.tsx` 用 dayjs，`form.store.ts:160-168` date 分支已用 `_value.toDate()` 取 epoch ms），本次不改日期处理逻辑。
- `Labeled.tsx:55-67` 的 `Select.Option` children 写法（非 antd5 推荐的 `options` prop）保留——仍可用，非弃用 API，不属于本次清理。

## 设计方案

### 修复 1：Labeled.tsx
```diff
-              dropdownMatchSelectWidth={false}
+              popupMatchSelectWidth={false}
```
antd5 将 `dropdownMatchSelectWidth` 重命名为 `popupMatchSelectWidth`（Select/Cascader 统一命名）。`SelectFilter.tsx:151` 已用新名，此处对齐。

### 修复 2：CascaderFilter.tsx
```diff
-        onDropdownVisibleChange={(visible: boolean) => {
-          if (visible) refreshSyncOptions();
+        onOpenChange={(open: boolean) => {
+          if (open) refreshSyncOptions();
         }}
```
antd5 将 `onDropdownVisibleChange` 重命名为 `onOpenChange`。`SelectFilter.tsx:120` 已用新名，此处对齐。语义完全一致（弹层显隐回调），仅改名。

### 修复 3：index.tsx 删除 remount key
```diff
       <GmButton
         style={{ display: trigger === 'onChange' ? 'none' : undefined }}
         type="primary"
-        key={store.loading ? Date.now().toString() : Date.now().toString()}
         loading={store.loading}
```
GmButton 的 loading 转圈由 `loading` prop 控制，无需 remount。原 key 两分支相同 → 每次 render key 都变 → 按钮 unmount/mount，浪费且打断 loading 动画。删除后按钮常驻，仅 `loading` prop 变化，转圈平滑。**无行为丢失**（原三元从未实现任何"loading 切换 remount"的意图）。

### 修复 4：重写 demos/basic.tsx

**数据来源**：仅用 `onSearch`，不依赖 `usePagination`（`form.store.ts:188-210` 的 `search()` 两条路径对 antd5 验证无差异，onSearch 自包含最简）。

**结构**：
- 顶部：`<TableFilter fields={FIELDS} onSearch={...} trigger="both" />`
- 底部：`<pre>` 展示最近一次 `onSearch` 收到的 params（JSON.stringify），用于肉眼确认取值正确

**FIELDS 覆盖**（对齐父文档 L80 验证项）：
| field key | type | 验证点 |
|-----------|------|--------|
| `name` | input | 文本输入 + 清空 + Enter/onBlur 触发 |
| `status` | select, multiple | 多选 tag + 搜索 + 清空 |
| `category` | cascader | 级联选择 + 搜索 |
| `date` | date | dayjs 单值取值（params 应为 epoch ms） |
| `range` | date, range:true, toParam | RangePicker 范围取值 + 默认快捷 ranges |

**预期 params（dayjs 取值）**：
- `date` → `+(_value as Dayjs).toDate()` = epoch ms（`form.store.ts:166`）
- `range` → 经 `toParam` 转为 `{ begin_time, end_time }`，值为 epoch ms（`form.store.ts:164`）

**底部 `<pre>` 期望 JSON 形状**（以选了张三/启用+停用/今天/近7天 为例）：
```json
{
  "name": "张三",
  "status": ["active", "inactive"],
  "category": [0, 0],
  "date": 1718400000000,
  "begin_time": 1717881600000,
  "end_time": 1718486399999
}
```
所有 date 类字段在 params 中必须是 `number`（epoch ms），不能是 dayjs 对象或字符串。

`onSearch` 实现：
```tsx
const [params, setParams] = useState<Record<string, any>>({});
// ...
<TableFilter
  fields={FIELDS}
  trigger="both"
  onSearch={(p) => { setParams(p); return Promise.resolve(); }}
/>
<pre>{JSON.stringify(params, null, 2)}</pre>
```

## 验证计划

1. `npm run tsc`（`tsc --noEmit`）0 错误
2. `npm run doc:dev` 起 dumi 文档站，打开 TableFilter demo：
   - input/select/date/range/cascader 五类字段渲染正常，无边框（`variant="borderless"`）
   - 控制台**无 v4 弃用警告**（修复 1/2 的 `dropdownMatchSelectWidth`/`onDropdownVisibleChange` warning 应消失）
   - 改 select/cascader → `trigger="both"` 自动触发搜索，底部 `<pre>` params 更新
   - date 单选 → params 中该字段为 number（epoch ms）
   - RangePicker → params 中为 `{ begin_time, end_time }`，值为 number
   - 点重置 → params 清空
   - 搜索按钮 loading 转圈平滑，无每次 render 闪烁
3. 交互通过后，把父文档 `2026-06-15-antd5-lossless-upgrade.md` 的 L80「待补充 TableFilter 交互验证」更新为已完成。

## 已知风险

- **低**：`popupMatchSelectWidth`/`onOpenChange` 纯改名，antd5 语义不变，无回归风险。
- **低**：删除 key 无行为丢失（见修复 3 论证）。
- **中**：dumi demo 依赖 `@gm-common/hooks`、mobx、dayjs——这些已是 gm-antd devDep/dep，文档站现有 demo（Table demo）已跑通，table-filter 应同样可跑；若 useGMLocale 在 dumi 下取不到 locale 文案，fallback 中文已内置（`|| '请选择'` 等），不阻塞渲染。
