---
category: Components
type: 布局
title: ContentWrapper
subtitle: 内容容器
cols: 1
tag: New
cover: https://gw.alipayobjects.com/zos/alicdn/hzEndUVEx/Layout.svg
---

erp 的@gm-pc/framework 的 content 容器

<img src="https://github.com/gmfe/gm-antd/blob/main/components/content-wrapper/demo/img/gm-framwork.png?raw=true"  height="400" >

## 何时使用

通常作为列表页`list.page.tsx`的内容容器

## API

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- | --- |
| left | 左边插槽，用于双栏内容布局 | ReactNode | - |  |
| leftWidth | 左边插槽宽度 | string | 25% | |  |
| top | 顶部插槽 | ReactNode | - |  |
| bottom | 底部固定插槽，保存、取消之类的动作 | ReactNode |  |  |
| smooth | Scroll 事件频率过高会产生性能、体验的流畅问题，通过此项禁用 scroll 监听来提升丝滑感，同时 context 中的 scroll 也数值也不再更新 | string \| number | - |  |
| hideScrollbarAtBottom | 滚到底部时隐藏滚动条 | boolean | false |  |
