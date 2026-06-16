---
title: Input 输入框
nav:
  title: 组件
  path: /components
group:
  title: 兼容垫片(antd4→5)
  order: 10
---

# Input 输入框

基于 antd5 Input 的 **v4 兼容垫片**。保留 `Input.TextArea` / `Input.Search` / `Input.Password` / `Input.Group` 静态成员,业务零改动。

## v4→v5 prop 翻译表

| antd4(v4) | antd5(v5) | 说明 |
|-----------|-----------|------|
| `bordered` | `variant` | `bordered={false}` → `variant="borderless"`;删除原 `bordered` 以消警告 |

## 基本用法

<code src="./demos/basic.tsx"></code>

## API

与 [antd Input](https://ant.design/components/input-cn) 一致,额外接受 `bordered`(v4 别名)。
