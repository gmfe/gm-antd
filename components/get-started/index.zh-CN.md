---
category: Components
title: 开始
type: 开始
---

本文档为观麦Erp新设计体系组件库文档。

由于我们项目中AntD版本已经难以随官方更新而升级，以及我们有覆盖全局样式、新增基础/业务组件的需求，再继续使用官方的包并在项目中做覆盖的实践并非最佳, 所以fork了**antd@v4.24.0**版本以此为基础改建为我们的观麦AntD组件库/文档。

新的包名为`gm-antd`。

## gm-antd

基于antd，gm-antd包含：
- 全局样式覆盖, 如调整主题色、圆角等；
- 少部分组件改写，比如考虑“将Button组件的onClick改为异步时pending自动设置loading、disabled状态”；
- 新增基础组件；
- 新增业务组件，比如列表页的条件筛选组件TableFilter;
- [表格定制](https://gmfe.github.io/gm-antd/components/table-cn/#components-table-demo-table-hook);
- ...
