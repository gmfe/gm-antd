---
title: Drawer 抽屉
nav:
  title: 组件
  path: /components
group:
  title: 兼容垫片(antd4→5)
  order: 10
---

# Drawer 抽屉

基于 antd5 Drawer 的 **v4 兼容垫片**。

## v4→v5 prop 翻译表

| antd4(v4) | antd5(v5) | 说明 |
|-----------|-----------|------|
| `visible` | `open` | 受控显隐 |
| `onVisibleChange` | `afterOpenChange` | ⚠️ 仅改名,**触发时机变化**:v4 即时回调,v5 为动画结束后(晚约 300ms) |
| `destroyOnClose` | `destroyOnHidden` | 关闭时销毁子元素 |

> 与 Modal 相同,`onVisibleChange` 的时机差异是 antd5 inherent breaking,无法消除。

## 基本用法

<code src="./demos/basic.tsx"></code>

## API

与 [antd Drawer](https://ant.design/components/drawer-cn) 一致,额外接受上表中的 v4 别名 prop。
