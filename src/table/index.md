---
title: Table 表格
nav:
  title: 组件
  path: /components
group:
  title: Table
  order: 1
---

# Table 表格

基于 antd Table 的增强表格组件，支持列宽拖拽调整（`isResizable`）。

## 基本用法

<code src="./demos/basic.tsx"></code>

## API

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| isResizable | 是否启用列宽拖拽。默认 fixed 列与最后一列不可拖拽，传对象可放开：`fixed` 允许 fixed 列拖拽，`lastColumn` 允许最后一列拖拽 | `boolean \| { fixed?: boolean; lastColumn?: boolean }` | `true` |

其余 API 与 [antd Table](https://ant.design/components/table-cn) 完全一致。
