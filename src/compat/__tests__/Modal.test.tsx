import React from 'react';

jest.mock('antd', () => {
  const ReactModule = require('react');
  // 模拟 antd5 Modal 静态方法: 保存传入 config 并返回, 测试用 __config 取回包装后的 onOk
  // destroy 模拟真实静态实例返回的销毁句柄
  const makeStatic = (): jest.Mock =>
    jest.fn((config: Record<string, unknown>) => ({ __config: config, destroy: jest.fn() }));
  const ModalMock: unknown = Object.assign(
    ReactModule.forwardRef(() => null),
    {
      confirm: makeStatic(),
      info: makeStatic(),
      success: makeStatic(),
      error: makeStatic(),
      warning: makeStatic(),
    },
  );
  return { Modal: ModalMock };
});

// jest.mock 提升到文件顶部, 之后再 import 被测模块(与 Select.test.tsx 同款惯例)
import Modal from '../Modal';
import { Modal as AntModal } from 'antd';

describe('compat Modal 命令式静态方法防连点', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('同步 onOk: 300ms 内双调只执行首次, 窗口过后放行', () => {
    const onOk = jest.fn();
    const ret = (Modal as unknown as Record<string, any>).confirm({ title: '删除', onOk });
    const wrapped = ret.__config.onOk as () => unknown;

    wrapped();
    wrapped();
    expect(onOk).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(301);
    wrapped();
    expect(onOk).toHaveBeenCalledTimes(2);

    // 传给底层 antd5 的是包装后的 onOk
    expect((AntModal as unknown as Record<string, any>).confirm).toHaveBeenCalledTimes(1);
    expect(ret.__config.onOk).not.toBe(onOk);
  });

  it('onOk 返回 Promise: 原样透传返回值, antd5 原生 loading 继续生效', () => {
    const promise = Promise.resolve();
    const onOk = jest.fn(() => promise);
    const ret = (Modal as unknown as Record<string, any>).confirm({ onOk });

    expect(ret.__config.onOk()).toBe(promise);
    expect(onOk).toHaveBeenCalledTimes(1);
  });

  it('未传 onOk 的 config: 注入保险丝钩子(唯一标记 + onOk/onCancel 关闭信号)', () => {
    (Modal as unknown as Record<string, any>).info({ title: '提示' });
    const calledWith = (AntModal as unknown as Record<string, any>).info.mock.calls[0][0];
    expect(calledWith.title).toBe('提示');
    // wrapClassName 注入唯一标记(用户自定义的保留在前)
    expect(calledWith.wrapClassName).toMatch(/^gm-static-modal-\d+$/);
    // 即使业务未传, 也注入 onOk/onCancel 作为关闭信号钩子
    expect(typeof calledWith.onOk).toBe('function');
    expect(typeof calledWith.onCancel).toBe('function');
  });

  it('P0 保险丝: 关闭发起后 500ms 强制移除残留 wrap(动画被打断场景)', () => {
    const ret = (Modal as unknown as Record<string, any>).info({ title: '提示' });
    const mark = ret.__config.wrapClassName as string;

    // 模拟动画被打断: wrap 残留在 DOM(正常路径 antd 早已卸载)
    const container = document.createElement('div');
    const wrap = document.createElement('div');
    wrap.className = `ant-modal-wrap ${mark}`;
    container.appendChild(wrap);
    document.body.appendChild(container);
    expect(document.querySelector('.' + mark)).not.toBeNull();

    // 用户点确定触发 onOk(关闭发起)
    (ret.__config.onOk as () => void)();
    jest.advanceTimersByTime(500);

    // 保险丝: 残留的 wrap 及其挂载容器被强制移除
    expect(document.querySelector('.' + mark)).toBeNull();
    expect(document.body.contains(container)).toBe(false);
  });

  it('P0 保险丝: 外部 destroy 同样触发清理', () => {
    const ret = (Modal as unknown as Record<string, any>).confirm({ title: '确认' });
    const mark = ret.__config.wrapClassName as string;

    const container = document.createElement('div');
    const wrap = document.createElement('div');
    wrap.className = `ant-modal-wrap ${mark}`;
    container.appendChild(wrap);
    document.body.appendChild(container);

    ret.destroy();
    jest.advanceTimersByTime(500);

    expect(document.querySelector('.' + mark)).toBeNull();
  });
});
