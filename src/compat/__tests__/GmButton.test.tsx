import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';

jest.mock('antd', () => {
  const ReactModule = require('react');
  return {
    Button: ReactModule.forwardRef((props: any, _ref: any) => (
      <button
        type="button"
        onClick={props.onClick}
        data-loading={props.loading ? 'true' : 'false'}
      >
        {props.children}
      </button>
    )),
  };
});

// jest.mock 提升到文件顶部, 之后再 import 被测模块(与 Select.test.tsx 同款惯例)
import Button from '../../button';

describe('GmButton 防连点', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('时间窗: 300ms 内快速双击只触发一次 onClick, 窗口过后放行', () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>提交</Button>);
    const btn = screen.getByRole('button', { name: '提交' });

    fireEvent.click(btn);
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(301);
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('throttle={false} 逃生口: 快速双击两次都触发', () => {
    const onClick = jest.fn();
    render(
      <Button onClick={onClick} throttle={false}>
        提交
      </Button>,
    );
    const btn = screen.getByRole('button', { name: '提交' });

    fireEvent.click(btn);
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('autoLoading 不回归: 返回 Promise 自动 loading, 时间窗过后飞行中点击仍被锁拦截', async () => {
    let resolveFn: (v: void) => void = () => {};
    const onClick = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveFn = resolve;
        }),
    );
    render(<Button onClick={onClick}>提交</Button>);
    const btn = screen.getByRole('button', { name: '提交' });

    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(btn.getAttribute('data-loading')).toBe('true');

    // 时间窗已过(排除时间窗拦截), 但 Promise 仍在飞行 → autoLoading 锁应拦截
    jest.advanceTimersByTime(301);
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(btn.getAttribute('data-loading')).toBe('true');

    resolveFn();
    await act(async () => {
      await Promise.resolve();
    });
    expect(btn.getAttribute('data-loading')).toBe('false');

    // loading 解除; 再推进时间窗(上次点击刷新了窗口起点) → 放行
    jest.advanceTimersByTime(301);
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(2);
  });
});
