import React from 'react';
import { ContentWrapper } from 'gm-antd';

export default () => (
  <ContentWrapper
    style={{ height: 400, border: '1px solid #d9d9d9', borderRadius: 4 }}
    top={
      <div style={{ padding: '8px 16px', background: '#fafafa', borderBottom: '1px solid #d9d9d9' }}>
        顶部栏（吸顶）
      </div>
    }
    bottom={
      <div style={{ padding: '8px 16px', background: '#fafafa', borderTop: '1px solid #d9d9d9', textAlign: 'right' }}>
        <button style={{ padding: '4px 16px', background: '#1677ff', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          保存
        </button>
      </div>
    }
  >
    <div style={{ padding: 16 }}>
      {Array.from({ length: 20 }, (_, i) => (
        <p key={i}>内容区域第 {i + 1} 行</p>
      ))}
    </div>
  </ContentWrapper>
);
