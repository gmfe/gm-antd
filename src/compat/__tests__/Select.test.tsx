import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
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
  it('关闭下拉时清空搜索词并通知外部', () => {
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
    expect(screen.getByTestId('search-value').textContent).toBe('');
    expect(onSearch).toHaveBeenNthCalledWith(1, '未');
    expect(onSearch).toHaveBeenNthCalledWith(2, '');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
