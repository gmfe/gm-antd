import React, { useState } from 'react';
import { Popconfirm, Button, Space, message } from 'gm-antd';

/**
 * 兼容验证:沿用 v4 的 visible / onVisibleChange(垫片翻译为 open / onOpenChange)。
 * 顺带验证 compat message.warn(v4 别名,运行时等价 message.warning)。
 */
export default () => {
  const [visible, setVisible] = useState(false);

  return (
    <Space>
      <Popconfirm
        title="确认执行此操作?"
        onConfirm={() => message.warn('已确认(message.warn v4 别名)')}
        onCancel={() => message.info('已取消')}
        okText="确认"
        cancelText="取消"
      >
        <Button>Hover 确认</Button>
      </Popconfirm>
      <Popconfirm
        title="受控显隐(v4 visible)"
        visible={visible}
        onVisibleChange={setVisible}
        onConfirm={() => setVisible(false)}
        okText="确认"
        cancelText="取消"
      >
        <Button>受控确认</Button>
      </Popconfirm>
    </Space>
  );
};
