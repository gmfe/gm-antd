---
title: Sortable 拖拽排序
nav:
  title: 组件
  path: /components
group:
  title: 数据展示
  order: 2
---

# Sortable 拖拽排序

基于 sortablejs 的拖拽排序组件，支持单列表排序、多列表分组拖拽。

## 基本用法

<code src="./demos/basic.tsx"></code>

## API

### SortableProps

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| data | 数据源 | `SortableDataItem[]` | - |
| onChange | 排序变化回调 | `(data: SortableDataItem[]) => void` | - |
| renderItem | 自定义渲染每项 | `(item, index) => ReactNode` | - |
| options | sortablejs 配置 | `Options` | - |
| disabled | 是否禁用 | `boolean` | `false` |

### GroupSortableProps

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| data | 二维数组数据源 | `SortableDataItem[][]` | - |
| onChange | 排序变化回调 | `(data: SortableDataItem[][]) => void` | - |
| children | 渲染多个列表 | `(items) => ReactElement` | - |

### SortableDataItem

| 参数 | 说明 | 类型 |
| --- | --- | --- |
| value | 唯一标识 | `any` |
| text | 显示文本 | `string` |
