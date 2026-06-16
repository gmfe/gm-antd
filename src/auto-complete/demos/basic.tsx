import React, { useState } from 'react';
import { AutoComplete } from 'gm-antd';

/**
 * 兼容验证:沿用 v4 options 风格,渲染正常(垫片处理 BaseSelect 改名 + bordered)。
 */
const options = [
  { value: 'apple', label: '苹果' },
  { value: 'banana', label: '香蕉' },
  { value: 'orange', label: '橙子' },
];

export default () => {
  const [value, setValue] = useState('');
  return (
    <AutoComplete
      options={options}
      value={value}
      onChange={setValue}
      placeholder="输入试试"
      style={{ width: 240 }}
    />
  );
};
