import React from 'react';
import { render, screen } from '@testing-library/react';
import DropdownRender from '../../select/DropdownRender';

describe('DropdownRender', () => {
  // 远程搜索场景: label 为 JSX, options 已是服务端过滤结果
  const groupedOptions = [
    {
      label: '饮品类',
      options: [
        { label: <span>可乐(kl6676)</span>, value: 'cola' },
        { label: <span>雪碧(xb1234)</span>, value: 'sprite' },
      ],
    },
  ];

  it('filterOption 为 false 时不做本地过滤,直接展示传入的 options', () => {
    render(
      <DropdownRender
        menu={<div />}
        mode="multiple"
        value={[]}
        options={groupedOptions}
        searchValue="可乐"
        filterOption={false}
      />,
    );

    expect(screen.queryByText('未找到结果')).toBeNull();
    expect(screen.getByText('可乐(kl6676)')).toBeTruthy();
    expect(screen.getByText('雪碧(xb1234)')).toBeTruthy();
  });

  it('filterOption 为函数时按函数结果过滤', () => {
    render(
      <DropdownRender
        menu={<div />}
        mode="multiple"
        value={[]}
        options={groupedOptions}
        searchValue="可乐"
        filterOption={(input: string, option: any) =>
          String(option?.value).includes('cola') && !!input
        }
      />,
    );

    expect(screen.getByText('可乐(kl6676)')).toBeTruthy();
    expect(screen.queryByText('雪碧(xb1234)')).toBeNull();
  });

  it('默认按 label 做本地过滤且全部不匹配时展示空态', () => {
    render(
      <DropdownRender
        menu={<div />}
        mode="multiple"
        value={[]}
        options={[{ label: '可乐', value: 'cola' }]}
        searchValue="雪碧"
      />,
    );

    expect(screen.getByText('未找到结果')).toBeTruthy();
  });
});
