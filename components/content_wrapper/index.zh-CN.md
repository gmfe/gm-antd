---
category: Components
type: 布局
title: ContentWrapper
subtitle: 内容容器
cover: https://gw.alipayobjects.com/zos/alicdn/hzEndUVEx/Layout.svg
---

erp的@gm-pc/framework的content容器

![image](https://)


## 何时使用

- 通常作为列表页`list.page.tsx`的内容容器

## API

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| children | 嵌套的标题 | ReactNode | - |  |
| className | 分割线样式类 | string | - |  |
| dashed | 是否虚线 | boolean | false |  |
| orientation | 分割线标题的位置 | `left` \| `right` \| `center` | `center` |  |
| orientationMargin | 标题和最近 left/right 边框之间的距离，去除了分割线，同时 `orientation` 必须为 `left` 或 `right` | string \| number | - |  |
| plain | 文字是否显示为普通正文样式 | boolean | false | 4.2.0 |
| style | 分割线样式对象 | CSSProperties | - |  |
| type | 水平还是垂直类型 | `horizontal` \| `vertical` | `horizontal` |  |
