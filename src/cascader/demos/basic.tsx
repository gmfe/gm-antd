import React, { useState } from 'react';
import { Cascader } from 'gm-antd';

/**
 * 兼容验证:沿用 v4 的 dropdownClassName / onDropdownVisibleChange / bordered,
 * 垫片翻译为 popupClassName / onOpenChange / variant。
 */
const options = [
  {
    value: 'digital',
    label: '数码',
    children: [
      { value: 'phone', label: '手机' },
      { value: 'laptop', label: '笔记本' },
    ],
  },
  {
    value: 'home',
    label: '家居',
    children: [{ value: 'furniture', label: '家具' }],
  },
];

export default () => {
  const [value, setValue] = useState<(string | number)[]>([]);
  return (
    <Cascader
      options={options}
      value={value}
      onChange={setValue}
      placeholder="请选择类目"
      dropdownClassName="v4-dropdown-className"
      style={{ width: 280 }}
    />
  );
};
