import React, { useState } from 'react';
import { Mentions } from 'gm-antd';

/**
 * 兼容验证:沿用 v4 options 风格,渲染正常(垫片处理 BaseSelect 改名 + bordered)。
 */
const options = [
  { value: 'zhangsan', label: '张三' },
  { value: 'lisi', label: '李四' },
  { value: 'wangwu', label: '王五' },
];

export default () => {
  const [value, setValue] = useState('');
  return (
    <Mentions
      options={options}
      value={value}
      onChange={setValue}
      placeholder="输入 @ 提及某人"
      style={{ width: 280 }}
    />
  );
};
