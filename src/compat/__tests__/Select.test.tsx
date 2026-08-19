import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Select from '../Select';

jest.mock('antd', () => {
  const ReactModule = require('react');
  return {
    Select: ReactModule.forwardRef((props: any, _ref: any) => (
      <>
        <button type="button" onClick={() => props.onSearch('未')}>
          输入搜索词
        </button>
        <button type="button" onClick={() => props.onOpenChange(false)}>
          关闭下拉
        </button>
        <span data-testid="search-value">{props.searchValue}</span>
      </>
    )),
  };
});

describe('GmSelect', () => {
  it('关闭下拉时延迟到宏任务再清空搜索词并通知外部', async () => {
    const onSearch = jest.fn();
    const onOpenChange = jest.fn();

    render(
      <Select
        mode="multiple"
        options={[{ label: '未结款', value: 'unsettled' }]}
        onSearch={onSearch}
        onOpenChange={onOpenChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '输入搜索词' }));
    expect(screen.getByTestId('search-value').textContent).toBe('未');

    fireEvent.click(screen.getByRole('button', { name: '关闭下拉' }));
    // onOpenChange 同步触发，但清空搜索词延迟到当前事件批次之后，
    // 让选中 value 先带着完整 options 完成一次渲染(rc-select label 缓存建立)
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('search-value').textContent).toBe('未');

    await waitFor(() =>
      expect(onSearch).toHaveBeenNthCalledWith(2, ''),
    );
    expect(screen.getByTestId('search-value').textContent).toBe('');
  });
});
