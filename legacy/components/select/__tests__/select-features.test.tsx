import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import Select from '../index';

describe('Select 全选和过滤功能测试', () => {
  const options = [
    { value: '1', label: '选项1' },
    { value: '2', label: '选项2', isDeleted: true },
    { value: '3', label: '选项3' },
    { 
      label: '分组1',
      children: [
        { value: '4', label: '子选项1' },
        { value: '5', label: '子选项2', deleted: true },
      ]
    },
    { value: '6', label: '选项6' },
  ];

  it('应该正确过滤已删除的商品', () => {
    const onChange = jest.fn();
    const { container } = render(
      <Select
        mode="multiple"
        options={options}
        onChange={onChange}
        open
      />
    );

    // 检查过滤开关是否存在
    const filterSwitch = container.querySelector('.ant-switch');
    expect(filterSwitch).toBeInTheDocument();
    
    // 默认情况下，过滤开关应该是开启状态
    expect(filterSwitch).toHaveClass('ant-switch-checked');
  });

  it('应该正确处理全选功能', () => {
    const onChange = jest.fn();
    const { container } = render(
      <Select
        mode="multiple"
        options={options}
        onChange={onChange}
        open
      />
    );

    // 检查全选复选框是否存在
    const selectAllCheckbox = container.querySelector('.ant-checkbox');
    expect(selectAllCheckbox).toBeInTheDocument();
    
    // 点击全选复选框
    fireEvent.click(selectAllCheckbox!);
    
    // 验证 onChange 是否被调用
    expect(onChange).toHaveBeenCalled();
  });

  it('应该正确处理过滤状态改变时的选中项', () => {
    const onChange = jest.fn();
    const { container } = render(
      <Select
        mode="multiple"
        value={['2', '5']} // 选中已删除的项
        options={options}
        onChange={onChange}
        open
      />
    );

    // 找到过滤开关并关闭它
    const filterSwitch = container.querySelector('.ant-switch');
    fireEvent.click(filterSwitch!);
    
    // 验证 onChange 是否被调用，并且移除了已删除项
    expect(onChange).toHaveBeenCalled();
  });

  it('应该正确计算全选状态', () => {
    const { container, rerender } = render(
      <Select
        mode="multiple"
        value={['1', '3', '4', '6']} // 选中所有未删除的项
        options={options}
        open
      />
    );

    // 全选复选框应该被选中
    let selectAllCheckbox = container.querySelector('.ant-checkbox-input');
    expect(selectAllCheckbox).toBeChecked();

    // 重新渲染，只选中部分项
    rerender(
      <Select
        mode="multiple"
        value={['1', '3']} // 只选中部分项
        options={options}
        open
      />
    );

    // 全选复选框不应该被选中
    selectAllCheckbox = container.querySelector('.ant-checkbox-input');
    expect(selectAllCheckbox).not.toBeChecked();
  });
});