import type { CSSProperties } from 'react';

export const secondButtonStyle: CSSProperties = {
  // 加 fallback: gmTheme 关闭了 cssVar(见 styles/theme.ts), 不加 fallback 时
  // var(--ant-color-primary) 解析为空 → 文字回退成黑色(second 型按钮文字变黑)。
  color: 'var(--ant-color-primary, #0363ff)',
  backgroundColor: '#f2f3f4',
  borderStyle: 'none',
};

export const secondButtonHoverStyle: CSSProperties = {
  backgroundColor: 'rgba(220, 233, 255)',
};

export const secondButtonDisabledStyle: CSSProperties = {
  color: 'rgba(0, 0, 0, 0.25)',
  backgroundColor: '#f5f5f5',
};
