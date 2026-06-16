import React, { useState } from 'react';
import { Drawer, Button } from 'gm-antd';

/**
 * 兼容验证:沿用 v4 的 visible / onVisibleChange / destroyOnClose,
 * 垫片翻译为 antd5 的 open / afterOpenChange / destroyOnHidden。
 */
export default () => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Button type="primary" onClick={() => setVisible(true)}>
        打开 Drawer
      </Button>
      <Drawer
        title="兼容验证"
        visible={visible}
        onVisibleChange={setVisible}
        destroyOnClose
        onClose={() => setVisible(false)}
        width={400}
      >
        <p>使用 v4 的 visible / onVisibleChange / destroyOnClose 渲染正常。</p>
        <p style={{ color: '#999', fontSize: 12 }}>
          注:onVisibleChange 在 antd5 下实际为 afterOpenChange,时机为动画结束后(晚约 300ms)。
        </p>
      </Drawer>
    </>
  );
};
