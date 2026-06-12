---
title: useTableResizable
nav:
  title: 组件
  path: /components
group:
  title: Table Hooks
  order: 5
---

# useTableResizable

表格列宽拖拽调整 Hook。默认已集成在 Table 组件中（`isResizable` 属性），也可独立使用。

## 基本用法

<code src="./demos/basic.tsx"></code>

## API

### 参数

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| columns | 列配置 | `ColumnsType` | `[]` |
| components | antd components | `object` | - |

### 返回值

| 参数 | 说明 | 类型 |
| --- | --- | --- |
| columns | 包含拖拽 handle 的列配置 | `ColumnsType` |
| components | 包含自定义 header cell 的 components | `object` |
