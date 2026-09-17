import React from 'react';

jest.mock('antd', () => {
  const ReactModule = require('react');
  // 模拟 antd5 Modal 静态方法: 保存传入 config 并返回, 测试用 __config 取回包装后的 onOk
  const makeStatic = (): jest.Mock =>
    jest.fn((config: Record<string, unknown>) => ({ __config: config }));
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

  it('未传 onOk 的 config: 原样透传给底层静态方法', () => {
    (Modal as unknown as Record<string, any>).info({ title: '提示' });
    expect((AntModal as unknown as Record<string, any>).info).toHaveBeenCalledWith({
      title: '提示',
    });
  });
});
