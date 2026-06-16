---
title: Menu 导航菜单
nav:
  title: 组件
  path: /components
group:
  title: 兼容垫片(antd4→5)
  order: 10
---

# Menu 导航菜单

基于 antd5 Menu 的 **v4 兼容垫片**。

## v4→v5 行为翻译

antd5 用 `items` prop 替代 v4 的 `<Menu.Item>` / `<Menu.SubMenu>` children。垫片层在运行时把 v4 children 结构转换为 `items[]`,**业务沿用 v4 的 Menu.Item/SubMenu 写法即可零改动**。

- `items`(v5 API)优先;未传时尝试把 `Menu.Item` / `Menu.SubMenu` children 转 `items`
- 保留 `Menu.Item` / `Menu.SubMenu` / `Menu.ItemGroup` / `Menu.Divider` 静态成员

## 基本用法(v4 Menu.Item / SubMenu 写法)

<code src="./demos/basic.tsx"></code>

## API

与 [antd Menu](https://ant.design/components/menu-cn) 一致,同时接受 v4 的 `<Menu.Item>` children 与 v5 的 `items`。
