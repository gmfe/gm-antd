import React from 'react';
import { Select } from 'gm-antd';

const options = [
  { value: 'apple', label: '苹果' },
  { value: 'banana', label: '香蕉' },
  { value: 'orange', label: '橙子' },
];

export default () => (
  <Select
    options={options}
    placeholder="请选择水果"
    style={{ width: 200 }}
  />
);
