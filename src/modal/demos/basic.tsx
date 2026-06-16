import React, { useState } from 'react';
import { Modal, Button } from 'gm-antd';

/**
 * 兼容验证:沿用 v4 风格的 `visible` / `onVisibleChange` / `destroyOnClose` API,
 * 垫片层会翻译为 antd5 的 `open` / `afterOpenChange` / `destroyOnHidden`,业务代码无需改动。
 */
export default () => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Button type="primary" onClick={() => setVisible(true)}>
        打开 Modal
      </Button>
      <Modal
        title="兼容验证"
        visible={visible}
        onVisibleChange={setVisible}
        destroyOnClose
        onOk={() => setVisible(false)}
        onCancel={() => setVisible(false)}
      >
        <p>使用 v4 的 visible / onVisibleChange / destroyOnClose 渲染正常。</p>
        <p style={{ color: '#999', fontSize: 12 }}>
          注:onVisibleChange 在 antd5 下实际翻译为 afterOpenChange,
          触发时机为动画结束后(比 v4 即时回调晚约 300ms),这是 antd5 inherent breaking,无法消除。
        </p>
      </Modal>
    </>
  );
};
