---
title: useTableVirtual
nav:
  title: 组件
  path: /components
group:
  title: Table Hooks
  order: 5
---

# useTableVirtual

表格虚拟滚动 Hook，基于 react-window 实现大数据量渲染优化。

## 基本用法

<code src="./demos/basic.tsx"></code>

## API

### 参数

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| columns | 列配置 | `ColumnsType` | - |
| dataSource | 数据源 | `DataType[]` | `[]` |
| rowHeight | 行高 | `number` | `54` |
| rowSelection | 行选择配置 | `TableRowSelection` | - |
| scroll | 滚动配置 | `{ x?: number, y?: number }` | - |
| components | 组件覆写 | `object` | - |

### 返回值

| 参数 | 说明 | 类型 |
| --- | --- | --- |
| columns | 处理后的列配置 | `ColumnsType` |
| dataSource | 处理后的数据源 | `DataType[]` |
| scroll | 处理后的滚动配置 | `object` |
| components | 包含虚拟滚动的 components | `object` |
| tableBodyRef | 表格体 ref | `RefObject` |
