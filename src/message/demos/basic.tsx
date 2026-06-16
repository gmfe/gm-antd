import React from 'react';
import { message, Button, Space } from 'gm-antd';

/**
 * 兼容验证:message.warn(v4 别名,运行时等价 message.warning)正常弹出提示。
 * 另展示 message.success / info / error 标准 API。
 */
export default () => (
  <Space wrap>
    <Button onClick={() => message.warn('warn(v4 别名)')}>message.warn</Button>
    <Button onClick={() => message.warning('warning(v5 标准)')}>message.warning</Button>
    <Button onClick={() => message.success('success')}>message.success</Button>
    <Button onClick={() => message.info('info')}>message.info</Button>
    <Button onClick={() => message.error('error')}>message.error</Button>
  </Space>
);
