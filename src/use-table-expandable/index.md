---
title: useTableExpandable
nav:
  title: 组件
  path: /components
group:
  title: Table Hooks
  order: 5
---

# useTableExpandable

表格展开行 Hook，提供受控的展开/收起功能，支持自定义展开图标。

## 基本用法

<code src="./demos/basic.tsx"></code>

## API

### 参数

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| rowKey | 行唯一标识字段名 | `string` | - |
| defaultExpandedRowKeys | 默认展开的行 key | `(string \| number)[]` | `[]` |
| expandedRowRender | 展开行渲染函数 | `(record) => ReactNode` | - |

其余参数与 antd `ExpandableConfig` 一致。

### 返回值

| 参数 | 说明 | 类型 |
| --- | --- | --- |
| controller | 控制器 | `{ toggle: (record) => void }` |
| newExpandable | 传给 Table 的 expandable 配置 | `ExpandableConfig` |
