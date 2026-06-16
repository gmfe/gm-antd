---
title: message 全局提示
nav:
  title: 组件
  path: /components
group:
  title: 兼容垫片(antd4→5)
  order: 10
---

# message 全局提示

基于 antd5 message 的 **v4 兼容垫片**。

## v4→v5 行为翻译

antd5 移除了 `message.warn`,垫片在 message 单例上**运行时补回 `warn` 别名**(等价 `message.warning`),业务沿用 `message.warn(...)` 即可零改动。

> ⚠️ `warn` 仅运行时生效,**TS 层不可见**(类型仍是 antd5 message,无 warn 方法签名)。需要 TS 通过时用 `message.warning`,或 `(message as any).warn(...)`。

## 基本用法

<code src="./demos/basic.tsx"></code>

## API

与 [antd message](https://ant.design/components/message-cn) 一致,额外接受运行时 `warn` 别名。
