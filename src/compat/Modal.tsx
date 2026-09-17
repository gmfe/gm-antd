import React from 'react';
import { Modal as AntModal } from 'antd';
import type { ModalFuncProps, ModalProps as AntModalProps } from 'antd';
import { withCompat } from './withCompat';

export type ModalProps = AntModalProps;

/** 防连点时间窗: 同一 confirm 弹窗的 onOk 300ms 内只执行首次 */
const THROTTLE_MS = 300;
/** 需要包装 onOk 的命令式静态方法(warn 是 warning 的废弃别名, 存在才包装) */
const CONFIRM_LIKE_STATICS = ['confirm', 'info', 'success', 'error', 'warning', 'warn'] as const;

const WrappedModal = withCompat(AntModal as React.ComponentType<ModalProps>, {
  // 注: onVisibleChange → afterOpenChange 是改名 + 时机变化。antd5 完全移除了 onVisibleChange,
  // 只剩 afterOpenChange(动画完成后触发, 比 v4 的即时 onVisibleChange 晚约 300ms)。
  // 这是 antd5 inherent breaking, 垫片只能改名让业务代码不用改, 无法消除时机差异。
  // 业务若依赖 onVisibleChange 的即时副作用(如关闭即重置表单), 需自行评估延迟影响或改用其他机制。
  rename: {
    visible: 'open',
    onVisibleChange: 'afterOpenChange',
    destroyOnClose: 'destroyOnHidden',
  },
});

// withCompat 只按引用拷贝静态成员, Modal.confirm 等原本直接走 antd5 原生 —— 命令式弹窗的
// 「确定」按钮不经过 GmButton, 快速双击时同步 onOk 会执行两次。这里显式覆盖:
// 给非 Promise 的 onOk 加 300ms 时间窗; 返回 Promise 的 onOk 原样透传返回值
// (antd5 原生 loading 防护继续生效, 不被破坏)。
for (const method of CONFIRM_LIKE_STATICS) {
  const original = (AntModal as unknown as Record<string, unknown>)[method];
  if (typeof original !== 'function') continue;
  const bound = original.bind(AntModal);
  (WrappedModal as unknown as Record<string, unknown>)[method] = (config: ModalFuncProps = {}) => {
    const userOnOk = config.onOk;
    if (typeof userOnOk !== 'function') {
      return bound(config);
    }
    // 时间窗闭包随本次 confirm 调用创建: 双击同一弹窗的确定键, 第二击在窗口内被忽略
    let lastCall = 0;
    return bound({
      ...config,
      onOk: (...args: unknown[]) => {
        const now = Date.now();
        if (now - lastCall < THROTTLE_MS) return;
        lastCall = now;
        return userOnOk(...args);
      },
    });
  };
}

export default WrappedModal;
