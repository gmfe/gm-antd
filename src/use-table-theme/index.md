---
title: useTableTheme
nav:
  title: 组件
  path: /components
group:
  title: Table Hooks
  order: 5
---

# useTableTheme

表格主题 Hook，为表格列提供统一样式包装，处理选中列、占位列等特殊样式。

## 基本用法

<code src="./demos/basic.tsx"></code>

## API

### 参数

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| columns | 列配置 | `ColumnsType` | `[]` |

### 返回值

| 参数 | 说明 | 类型 |
| --- | --- | --- |
| columns | 处理后的列配置 | `ColumnsType` |
