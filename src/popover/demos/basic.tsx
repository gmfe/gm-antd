import React, { useState } from 'react';
import { Popover, Button, Space } from 'gm-antd';

/**
 * 兼容验证:沿用 v4 的 visible / onVisibleChange,垫片翻译为 open / onOpenChange。
 */
export default () => {
  const [visible, setVisible] = useState(false);

  const content = (
    <div>
      <p>气泡内容</p>
      <Button type="link" size="small" onClick={() => setVisible(false)}>
        关闭
      </Button>
    </div>
  );

  return (
    <Space>
      <Popover content={content} title="标题">
        <Button>Hover 触发</Button>
      </Popover>
      <Popover
        content={content}
        title="受控显隐(v4 visible)"
        trigger="click"
        visible={visible}
        onVisibleChange={setVisible}
      >
        <Button>点击受控切换</Button>
      </Popover>
    </Space>
  );
};
