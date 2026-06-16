---
title: AutoComplete 自动完成
nav:
  title: 组件
  path: /components
group:
  title: 兼容垫片(antd4→5)
  order: 10
---

# AutoComplete 自动完成

基于 antd5 AutoComplete 的 **v4 兼容垫片**(BaseSelect 系列改名)。保留 `Option` 静态成员。

## v4→v5 prop 翻译表

| antd4(v4) | antd5(v5) |
|-----------|-----------|
| `dropdownClassName` | `popupClassName` |
| `dropdownMatchSelectWidth` | `popupMatchSelectWidth` |
| `dropdownRender` | `popupRender` |
| `onDropdownVisibleChange` | `onOpenChange` |
| `bordered` | `variant`(`false` → `borderless`) |

## 基本用法

<code src="./demos/basic.tsx"></code>

## API

与 [antd AutoComplete](https://ant.design/components/auto-complete-cn) 一致,额外接受上表中的 v4 别名 prop。
