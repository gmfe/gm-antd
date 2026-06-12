---
title: 快速上手
nav:
  title: 指南
  order: 1
group:
  title: 基础
  order: 1
---

# 快速上手

## 安装

```bash
npm install gm-antd
```

## 使用

gm-antd 完全兼容 antd 5 的所有 API，同时扩展了企业级组件和 Hooks。

```tsx | pure
import { Table, useTableSelection, useTableDIY, Button } from 'gm-antd';
```

## 与 antd 的关系

gm-antd 采用 **Wrapper Layer** 模式：

- `export * from 'antd'` — 透传所有 antd 组件和 API
- 对部分组件进行增强（Button、Select、Table）
- 提供独立的扩展组件（ContentWrapper、TableFilter、TablePagination、Icon、Sortable）
- 提供 Table Hooks（useTableDIY、useTableSelection 等）

所有增强 API 都是 antd 原有 API 的超集，不会破坏已有用法。
