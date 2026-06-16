---
title: Tooltip 文字提示
nav:
  title: 组件
  path: /components
group:
  title: 兼容垫片(antd4→5)
  order: 10
---

# Tooltip 文字提示

基于 antd5 Tooltip 的 **v4 兼容垫片**。

## v4→v5 prop 翻译表

| antd4(v4) | antd5(v5) | 说明 |
|-----------|-----------|------|
| `visible` | `open` | 受控显隐 |
| `onVisibleChange` | `onOpenChange` | 显隐回调(即时,无时机差) |

## 基本用法

<code src="./demos/basic.tsx"></code>

## API

与 [antd Tooltip](https://ant.design/components/tooltip-cn) 一致,额外接受上表中的 v4 别名 prop。
