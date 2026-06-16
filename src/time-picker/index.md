---
title: TimePicker 时间选择框
nav:
  title: 组件
  path: /components
group:
  title: 通用
  order: 1
---

# TimePicker 时间选择框

gm-antd 直接透传 antd5 的 `TimePicker`。

> ⚠️ **与 DatePicker 不同,TimePicker 没有做 v4 兼容垫片**:antd5 内部用 `dayjs`,且 antd4 的 TimePicker 同样基于 moment/moment-timezone,迁移收益小,故直接透传 antd5 原生实现。
>
> 若业务沿用 v4 的 `moment` 取值,需在调用边界自行 `moment ↔ dayjs` 转换;推荐直接使用 `dayjs`(参考 [dayjs 文档](https://day.js.org/))。

## 基本用法

<code src="./demos/basic.tsx"></code>

## API

与 [antd TimePicker](https://ant.design/components/time-picker-cn) 完全一致(`value`/`onChange` 等使用 **dayjs** 类型)。
