import React, { useState } from 'react';
import { Tooltip, Button, Space } from 'gm-antd';

/**
 * 兼容验证:沿用 v4 的 visible / onVisibleChange,垫片翻译为 open / onOpenChange(即时回调,无时机差)。
 */
export default () => {
  const [visible, setVisible] = useState(false);

  return (
    <Space>
      <Tooltip title="hover 提示文字">
        <Button>Hover 触发</Button>
      </Tooltip>
      <Tooltip
        title="受控显隐(v4 visible)"
        visible={visible}
        onVisibleChange={setVisible}
      >
        <Button onClick={() => setVisible(!visible)}>点击受控切换</Button>
      </Tooltip>
    </Space>
  );
};
