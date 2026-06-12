---
title: useTableSelection
nav:
  title: 组件
  path: /components
group:
  title: Table Hooks
  order: 5
---

# useTableSelection

表格行选择 Hook，支持父子联动选择、全选、跨页全选等功能。

## 基本用法

<code src="./demos/basic.tsx"></code>

## API

### 参数

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| dataSource | 数据源 | `DataType[]` | `[]` |
| keyName | 行唯一标识字段名 | `string \| number` | - |
| rowSelection | antd rowSelection 配置 | `TableRowSelection` | `{}` |
| components | antd components 配置 | `object` | - |
| totalCount | 总数据量（用于跨页全选） | `number` | - |
| mode | 选择模式 | `'all' \| 'parent' \| 'child'` | `'all'` |
| childrenColumnName | 子节点字段名 | `string` | `'children'` |
| disabled | 判断行是否禁用 | `(record, isParent?) => boolean` | `() => false` |
| onSelect | 选中回调 | `(record, selected) => void` | - |

### 返回值

| 参数 | 说明 | 类型 |
| --- | --- | --- |
| rowSelection | 传给 Table 的 rowSelection | `TableRowSelection` |
| rowKey | 传给 Table 的 rowKey | `string` |
| components | 传给 Table 的 components | `object` |
| selectedRowKeys | 已选中的 key 列表 | `(string \| number)[]` |
| selectedRows | 已选中的行数据 | `DataType[]` |
| isSelectedAll | 是否全选 | `boolean` |
| controller | 选择控制器 | `UseTableSelectionController` |
| BatchActions | 批量操作栏组件 | `FC` |
