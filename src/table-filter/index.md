---
title: TableFilter 筛选
nav:
  title: 组件
  path: /components
group:
  title: 数据展示
  order: 2
---

# TableFilter 筛选

可配置的表格筛选栏，支持多种字段类型（输入框、选择器、日期、级联、自定义），字段显隐自定义，展开收起等功能。

## 基本用法

<code src="./demos/basic.tsx"></code>

## API

### TableFilterProps

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| fields | 筛选字段配置 | `FieldItem[]` | - |
| onSearch | 搜索回调 | `(params: any) => void` | - |
| id | 唯一标识（用于状态持久化） | `string` | 当前 URL pathname |
| immediate | 挂载时是否立即搜索 | `boolean` | `false` |
| trigger | 触发方式 | `'onChange' \| 'manual' \| 'both'` | `'onChange'` |
| isExpanded | 支持展开收起 | `boolean` | `false` |
| isSaveOptions | 持久化字段显隐到 localStorage | `boolean` | `false` |
| resetFn | 额外重置逻辑 | `(params?) => void` | - |

### FieldItem 支持的类型

| type | 说明 |
| --- | --- |
| `input` | 输入框 |
| `select` | 选择器（支持远程搜索） |
| `date` | 日期选择（`range: false`） / 日期范围（`range: true`） |
| `cascader` | 级联选择 |
| `customize` | 自定义渲染 |

### 静态方法

| 方法 | 说明 |
| --- | --- |
| `TableFilter.get(id?)` | 获取筛选 store 实例 |
