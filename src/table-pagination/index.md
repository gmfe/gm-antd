---
title: TablePagination 分页
nav:
  title: 组件
  path: /components
group:
  title: 数据展示
  order: 2
---

# TablePagination 分页

表格分页栏组件，封装 antd Pagination 并对接 `@gm-common/hooks` 的分页逻辑。

## 基本用法

<code src="./demos/basic.tsx"></code>

## API

### TablePaginationProps

继承 antd `PaginationProps`，额外属性：

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| paginationResult | 分页 hook 返回结果 | `UsePaginationResult` | - |
| left | 左侧内容 | `ReactNode` | - |
| onPageChange | 翻页后回调 | `() => void` | - |

### TablePagination.InfoField

信息展示子组件：

| 参数 | 说明 | 类型 |
| --- | --- | --- |
| label | 标签 | `ReactNode` |
| value | 值 | `ReactNode` |

### 常量

| 名称 | 值 |
| --- | --- |
| `TABLE_PAGINATION_HEIGHT` | `52` |
