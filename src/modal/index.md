---
title: Modal 对话框
nav:
  title: 组件
  path: /components
group:
  title: 兼容垫片(antd4→5)
  order: 10
---

# Modal 对话框

基于 antd5 Modal 的 **v4 兼容垫片**。业务沿用 antd4 的 API 即可零改动升级,垫片层负责把 v4 弃用 prop 翻译为 v5。

## v4→v5 prop 翻译表

| antd4(v4) | antd5(v5) | 说明 |
|-----------|-----------|------|
| `visible` | `open` | 受控显隐 |
| `onVisibleChange` | `afterOpenChange` | ⚠️ 仅改名,**触发时机变化**:v4 即时回调,v5 为动画结束后(晚约 300ms) |
| `destroyOnClose` | `destroyOnHidden` | 关闭时销毁子元素 |

> antd5 完全移除了 `onVisibleChange`,垫片只能改名让业务代码不用改,**无法消除时机差异**。若业务依赖关闭即时副作用(如关闭即重置表单),需自行评估延迟影响或改用其他机制。

## 基本用法

<code src="./demos/basic.tsx"></code>

## API

与 [antd Modal](https://ant.design/components/modal-cn) 一致,额外接受上表中的 v4 别名 prop。
