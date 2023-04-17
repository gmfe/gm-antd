---
category: Components
cols: 1
type: 业务
title: TableFilter
subtitle: 过滤查询
cover: https://gw.alipayobjects.com/zos/alicdn/f-SbcX2Lx/Table.svg
---

常用于列表页的条件过滤

## API

### TableFilter

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| id | 唯一 ID | string | 默认使用当前路由字符串作为 id，如果同一路由下使用了多个，需要手动指定唯一 id |  |
| fields | 字段配置 | [FieldItem]\[],不同`type`的`field`的配置不相同，见类型声明或代码提示 | [] |  |
| paginationResult | `usePagination`的返回值, `{ run: (params)=>Promise<void> }` | { run: (params)=>Promise<void> } | - |  |
| immediate | 是否就绪后即刻提交一次查询 | boolean | `false` |  |
| trigger | 触发类型,触发搜索的方式；`manual` 点击“查询”按钮后才查询；`onChange` 字段表单变化后查询，且查询和重置按钮会被隐藏； `both` 字段表单变化后查询，点击“查询”按钮后查询； | string | `manual` |  |

### TableFilter 实例

`TableFilter.get(id)`获取到的实例包含以下 api：

| 方法       | 说明                           | 类型 | 默认值 | 版本 |
| ---------- | ------------------------------ | ---- | ------ | ---- |
| .get(key)  | 获取指定字段的值               |      |        |      |
| .set(key)  | 设置指定字段的值               |      |        |
| .search()  | 提交查询请求                   |      |        |      |
| .toPrams() | 返回表单内容转换的 json 键值对 |      |        |      |
| .reset()   | 清空                           |      |        |      |
