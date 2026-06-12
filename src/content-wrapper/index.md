---
title: ContentWrapper
nav:
  title: 组件
  path: /components
group:
  title: 布局
  order: 3
---

# ContentWrapper

页面级布局容器，支持左侧边栏、吸顶/吸底插槽、滚动条自动隐藏等功能。

## 基本用法

<code src="./demos/basic.tsx"></code>

## API

### ContentWrapperProps

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| top | 吸顶插槽 | `ReactNode` | - |
| bottom | 吸底插槽 | `ReactNode` | - |
| left | 左侧边栏内容 | `ReactNode` | - |
| leftWidth | 左侧边栏宽度 | `string` | `'25%'` |
| hideScrollbarAtBottom | 滚动到底部时隐藏滚动条 | `boolean` | `false` |
| smooth | 禁用滚动监听以提升性能 | `boolean` | `false` |

### ContentWrapperContext

| 属性 | 说明 | 类型 |
| --- | --- | --- |
| container | 容器 DOM | `HTMLElement` |
| width/height | 容器尺寸 | `number` |
| scrollTop/scrollBottom | 滚动距离 | `number` |
| scrollbar | 是否显示滚动条 | `boolean` |
| atBottom | 是否滚动到底部 | `boolean` |
