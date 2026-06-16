---
title: DatePicker 日期选择框
nav:
  title: 组件
  path: /components
group:
  title: 兼容垫片(antd4→5)
  order: 10
---

# DatePicker 日期选择框

基于 antd5 DatePicker 的 **v4 兼容垫片**。**核心价值:业务沿用 antd4 的 `moment` 取值即可零改动**,垫片层负责 `moment ↔ dayjs` 双向转换(时区感知)。

## v4→v5 行为翻译

antd5 内部用 `dayjs`,v4 用 `moment`。垫片在边界做转换:

| 边界 | 转换 |
|------|------|
| `value` / `defaultValue` / `defaultPickerValue`(入) | `moment → dayjs` |
| `onChange(value, ...)`(出) | `dayjs → moment`(回调拿到的是 moment) |
| `disabledDate(current)` | `current` 回调参数为 moment |
| `RangePicker` | `[moment, moment]` 元组双向转换 |

另含 BaseSelect 系列 `bordered` → `variant` 转换。保留 `DatePicker.RangePicker` 静态成员。

## 基本用法(传 moment 值,onChange 回调拿 moment)

<code src="./demos/basic.tsx"></code>

## API

与 [antd DatePicker](https://ant.design/components/date-picker-cn) 一致,但 `value` / `defaultValue` / `onChange` 等使用 **moment** 类型(v4 兼容)。
