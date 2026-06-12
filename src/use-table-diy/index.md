---
title: useTableDIY
nav:
  title: 组件
  path: /components
group:
  title: Table Hooks
  order: 5
---

# useTableDIY

表格列自定义 Hook，支持用户自定义显示/隐藏、排序、分组等操作。

## 基本用法

<code src="./demos/basic.tsx"></code>

## API

### 参数

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| columns | 原始列配置 | `ColumnsType` | - |
| config | 列配置项 | `Record<string, ConfigItem>` | `{}` |
| localStorageKey | 本地存储 key | `string` | - |

### 返回值

| 参数 | 说明 | 类型 |
| --- | --- | --- |
| columns | 处理后的列配置 | `ColumnsType` |
| DiyButton | DIY 设置按钮组件 | `FC` |
