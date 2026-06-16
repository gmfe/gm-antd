---
title: Select 选择器
nav:
  title: 组件
  path: /components
group:
  title: 通用
  order: 1
---

# Select 选择器

基于 antd Select 的增强选择器组件(GmSelect)。

## 增强能力

相对原生 antd5 Select,GmSelect 额外提供:

| Prop | 默认 | 说明 |
|------|------|------|
| `isShowCheckedAll` | `true` | 多选模式下,下拉底部渲染「全选」(支持分组扁平化全选) |
| `isShowDeletedSwitch` | `false` | 下拉底部渲染「过滤已删除」开关,过滤带 `isDeleted`/`deleted` 的选项 |
| `isRenderDefaultBottom` | `true` | 是否渲染上述底部增强区 |

> 注:GmSelect **强制 `showSearch=true`**(增强需要搜索能力),且**不支持 children 写法**(请用 `options`,传 children 会 dev warning 并忽略)。同时兼容 v4 的 `dropdownClassName`/`dropdownMatchSelectWidth`/`dropdownRender`/`bordered` 改名。

## 基本用法

<code src="./demos/basic.tsx"></code>

## 多选增强(全选 / 过滤已删除)

<code src="./demos/multi.tsx"></code>

## API

基于 [antd Select](https://ant.design/components/select-cn),额外接受上表增强 prop 与 v4 别名 prop。
