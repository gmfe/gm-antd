import type { ModalFuncProps, ModalProps as AntModalProps } from 'antd';
import { Modal as AntModal } from 'antd';
import type React from 'react';
import { withCompat } from './withCompat';

export type ModalProps = AntModalProps;

/** 防连点时间窗: 同一 confirm 弹窗的 onOk 300ms 内只执行首次 */
const THROTTLE_MS = 300;
/** 需要包装 onOk 的命令式静态方法(warn 是 warning 的废弃别名, 存在才包装) */
const CONFIRM_LIKE_STATICS = ['confirm', 'info', 'success', 'error', 'warning', 'warn'] as const;
/** 关闭动画标称 ~300ms; 关闭发起后 500ms 仍残留 DOM 视为动画被打断 */
const WRAP_CLEANUP_DELAY_MS = 500;
/** 静态实例 wrap 残留保险丝的唯一标记前缀 */
const STATIC_MARK_PREFIX = 'gm-static-modal-';
let staticModalUid = 0;

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
}) as typeof AntModal;

/**
 * P0 修复(2026-09 ERP 线上事故): Modal.info 等静态方法在 antd5 + React18 下,
 * rc-motion 关闭动画被打断时 afterClose 不会触发, antd 的卸载流程随之中断 ——
 * .ant-modal-wrap(含 mask)残留全屏且视觉透明, 拦截所有真实鼠标点击,
 * 用户感知为"页面卡死、保存不了"(现场实锤: CPU 空闲 + wrap 残留且
 * 内部 .ant-modal offsetHeight > 0)。
 *
 * 保险丝: 关闭路径(destroy / onOk / onCancel)发起后 500ms, 若带标记的 wrap
 * 仍在 DOM(正常路径 antd 早已卸载完毕), 强制移除整个静态实例挂载容器,
 * 并在页面上已无任何 ant-modal-wrap 时释放 body 滚动锁。
 */
function removeStaticModalWraps(wraps: Element[]) {
  wraps.forEach(wrap => {
    // 静态实例的挂载容器(body 直下的裸 div, 内含 wrap + mask), 从根上移除
    const container = wrap.parentElement;
    if (container && container !== document.body) {
      container.remove();
    } else if (wrap instanceof HTMLElement) {
      wrap.remove();
    }
  });
  // 动画中断时 antd 的 scrollLocker 同样不会恢复, 手动兜底
  if (!document.querySelector('.ant-modal-wrap')) {
    document.body.style.removeProperty('overflow');
    document.body.classList.remove('ant-scrolling-effect');
  }
}

function scheduleWrapCleanup(mark: string) {
  window.setTimeout(() => {
    removeStaticModalWraps(
      Array.prototype.slice.call(document.querySelectorAll(`.${mark}`)) as Element[],
    );
  }, WRAP_CLEANUP_DELAY_MS);
}

// withCompat 只按引用拷贝静态成员, Modal.confirm 等原本直接走 antd5 原生 —— 命令式弹窗的
// 「确定」按钮不经过 GmButton, 快速双击时同步 onOk 会执行两次。这里显式覆盖:
// 1. 给非 Promise 的 onOk 加 300ms 时间窗(返回 Promise 的原样透传, antd5 原生 loading 防护继续生效);
// 2. 所有静态实例注入唯一标记 + 关闭路径保险丝(见 scheduleWrapCleanup)。
CONFIRM_LIKE_STATICS.forEach(method => {
  const original = (AntModal as unknown as Record<string, unknown>)[method];
  if (typeof original !== 'function') return;
  const bound = original.bind(AntModal);
  (WrappedModal as unknown as Record<string, unknown>)[method] = (config: ModalFuncProps = {}) => {
    const userOnOk = config.onOk;
    const userOnCancel = config.onCancel;
    // 时间窗闭包随本次调用创建: 双击同一弹窗的确定键, 第二击在窗口内被忽略
    let lastCall = 0;
    const mark = STATIC_MARK_PREFIX + ++staticModalUid;
    const schedule = () => scheduleWrapCleanup(mark);

    const instance = bound({
      ...config,
      wrapClassName: config.wrapClassName ? `${config.wrapClassName} ${mark}` : mark,
      // 即使业务没传 onOk/onCancel 也注入: 点确定/取消/X/mask/ESC 的关闭同样需要
      // 调度保险丝(antd 关闭时会调用这两个回调, 是天然的关闭信号钩子)
      onOk: (...args: unknown[]) => {
        const now = Date.now();
        if (now - lastCall < THROTTLE_MS) return;
        lastCall = now;
        let result: unknown;
        if (typeof userOnOk === 'function') {
          result = userOnOk(...args);
        }
        // antd 仅在 Promise fulfilled 后关闭弹窗; rejected 时会停止 loading 并保持弹窗打开
        if (result && typeof (result as Promise<unknown>).then === 'function') {
          Promise.resolve(result).then(schedule, () => undefined);
        } else {
          schedule();
        }
        return result;
      },
      onCancel: (...args: unknown[]) => {
        const result = userOnCancel?.(...args);
        schedule();
        return result;
      },
    });

    // 外部主动 destroy(调用方持有返回值手动关闭)也纳入保险丝
    if (instance && typeof instance.destroy === 'function') {
      const origDestroy = instance.destroy.bind(instance);
      instance.destroy = () => {
        origDestroy();
        schedule();
      };
    }
    return instance;
  };
});

// destroyAll 不会经过单实例的 destroy 包装。先快照本次要关闭的静态实例，避免延时清理
// 误删 destroyAll 调用后新打开的弹窗。
const originalDestroyAll = AntModal.destroyAll.bind(AntModal);
WrappedModal.destroyAll = () => {
  const wraps = (
    Array.prototype.slice.call(document.querySelectorAll('.ant-modal-wrap')) as Element[]
  ).filter(wrap =>
    (wrap.getAttribute('class') || '')
      .split(/\s+/)
      .some(className => className.startsWith(STATIC_MARK_PREFIX)),
  );
  originalDestroyAll();
  window.setTimeout(() => removeStaticModalWraps(wraps), WRAP_CLEANUP_DELAY_MS);
};

export default WrappedModal;
