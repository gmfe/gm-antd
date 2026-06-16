import React from 'react';
import { Input, Space } from 'gm-antd';

/**
 * 兼容验证:
 * 1. bordered={false}(v4)→ 垫片翻译为 variant="borderless"(无 v4 弃用警告)
 * 2. Input.TextArea / Search / Password 静态成员仍在
 */
export default () => (
  <Space direction="vertical" style={{ width: '100%', maxWidth: 360 }}>
    <Input placeholder="默认(有边框)" />
    <Input bordered={false} placeholder="v4 bordered={false}(无边框)" />
    <Input.TextArea rows={2} placeholder="Input.TextArea" />
    <Input.Search placeholder="Input.Search" enterButton />
    <Input.Password placeholder="Input.Password" />
  </Space>
);
