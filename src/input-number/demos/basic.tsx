import React from 'react';
import { InputNumber, Space } from 'gm-antd';

/**
 * 兼容验证:bordered={false}(v4)→ 垫片翻译为 variant="borderless"(无 v4 弃用警告)。
 */
export default () => (
  <Space direction="vertical">
    <InputNumber defaultValue={0} />
    <InputNumber bordered={false} defaultValue={0} />
  </Space>
);
