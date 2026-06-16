import React, { useState } from 'react';
import { TreeSelect } from 'gm-antd';

/**
 * 兼容验证:沿用 v4 的 treeData + SHOW_PARENT 策略,渲染正常;
 * 静态成员 TreeSelect.SHOW_ALL / SHOW_PARENT / SHOW_CHILD 仍在。
 */
const treeData = [
  {
    title: '数码',
    value: 'digital',
    children: [
      { title: '手机', value: 'phone' },
      { title: '笔记本', value: 'laptop' },
    ],
  },
  {
    title: '家居',
    value: 'home',
    children: [{ title: '家具', value: 'furniture' }],
  },
];

export default () => {
  const [value, setValue] = useState<string>();
  return (
    <TreeSelect
      treeData={treeData}
      value={value}
      onChange={setValue}
      treeCheckable
      showCheckedStrategy={TreeSelect.SHOW_PARENT}
      placeholder="请选择(v4 风格)"
      style={{ width: 280 }}
    />
  );
};
