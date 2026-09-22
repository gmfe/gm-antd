import { Modal as AntModal } from 'antd';
import Modal from '../Modal';

jest.mock('antd', () => {
  // eslint-disable-next-line global-require
  const ReactModule = require('react');
  // 模拟 antd5 Modal 静态方法: 保存传入 config 并返回, 测试用 __config 取回包装后的 onOk
  // destroy 模拟真实静态实例返回的销毁句柄
  const makeStatic = (): jest.Mock =>
    jest.fn((config: Record<string, unknown>) => ({ __config: config, destroy: jest.fn() }));
  const ModalMock = ReactModule.forwardRef(() => null);
  ModalMock.confirm = makeStatic();
  ModalMock.info = makeStatic();
  ModalMock.success = makeStatic();
  ModalMock.error = makeStatic();
  ModalMock.warning = makeStatic();
  ModalMock.destroyAll = jest.fn();
  return { Modal: ModalMock };
});

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

  it('onOk Promise rejected: 保持弹窗, 不触发残留清理', async () => {
    const promise = Promise.reject(new Error('保存失败'));
    const ret = (Modal as unknown as Record<string, any>).confirm({ onOk: () => promise });
    const mark = ret.__config.wrapClassName as string;
    const container = document.createElement('div');
    const wrap = document.createElement('div');
    wrap.className = `ant-modal-wrap ${mark}`;
    container.appendChild(wrap);
    document.body.appendChild(container);

    expect(ret.__config.onOk()).toBe(promise);
    await promise.catch(() => undefined);
    jest.advanceTimersByTime(500);

    expect(document.querySelector(`.${mark}`)).toBe(wrap);
    container.remove();
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
    expect(document.querySelector(`.${mark}`)).not.toBeNull();

    // 用户点确定触发 onOk(关闭发起)
    (ret.__config.onOk as () => void)();
    jest.advanceTimersByTime(500);

    // 保险丝: 残留的 wrap 及其挂载容器被强制移除
    expect(document.querySelector(`.${mark}`)).toBeNull();
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

    expect(document.querySelector(`.${mark}`)).toBeNull();
  });

  it('P0 保险丝: destroyAll 只清理调用时已有实例, 不误删之后新开的弹窗', () => {
    const oldRet = (Modal as unknown as Record<string, any>).confirm({ title: '旧弹窗' });
    const oldContainer = document.createElement('div');
    const oldWrap = document.createElement('div');
    oldWrap.className = `ant-modal-wrap ${oldRet.__config.wrapClassName}`;
    oldContainer.appendChild(oldWrap);
    document.body.appendChild(oldContainer);

    Modal.destroyAll();

    const newRet = (Modal as unknown as Record<string, any>).confirm({ title: '新弹窗' });
    const newContainer = document.createElement('div');
    const newWrap = document.createElement('div');
    newWrap.className = `ant-modal-wrap ${newRet.__config.wrapClassName}`;
    newContainer.appendChild(newWrap);
    document.body.appendChild(newContainer);
    jest.advanceTimersByTime(500);

    expect(document.body.contains(oldContainer)).toBe(false);
    expect(document.body.contains(newContainer)).toBe(true);
    newContainer.remove();
  });
});
