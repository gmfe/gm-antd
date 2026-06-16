---
title: Tabs 标签页
nav:
  title: 组件
  path: /components
group:
  title: 兼容垫片(antd4→5)
  order: 10
---

# Tabs 标签页

基于 antd5 Tabs 的 **v4 兼容垫片**。

## v4→v5 行为翻译

antd5 用 `items` prop 替代 v4 的 `<Tabs.TabPane>` children。垫片层在运行时把 `<Tabs.TabPane key label>` children 转换为 `items[]`,**业务沿用 v4 的 TabPane children 写法即可零改动**。

- `items`(v5 API)优先;未传时尝试把 `TabPane` children 转 `items`
- 保留 `Tabs.TabPane` 静态成员(业务做类型/引用用)

## 基本用法(v4 TabPane children 写法)

<code src="./demos/basic.tsx"></code>

## API

与 [antd Tabs](https://ant.design/components/tabs-cn) 一致,同时接受 v4 的 `<Tabs.TabPane>` children 与 v5 的 `items`。
