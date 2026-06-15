import { message } from 'antd';

// antd5 移除了 message.warn, 在 message 单例上补回 warn 别名(v4 兼容)。
// message 是模块单例, plan 原版的 `as unknown as typeof message & {warn}` 与此处运行时等价(同一对象引用),
// 但原版会让 tsc --emitDeclarationOnly 报 TS4023(compatMessage 类型引用 antd 内部 BaseMethods 无法命名)。
// 这里 re-export 原始 message(类型可命名), warn 运行时挂载(类型层用 message.warning)。
(message as any).warn = message.warning;

export { message };
export default message;
