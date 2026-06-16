/**
 * GM theme configuration for antd 5 ConfigProvider.
 * Replaces reset_theme.less.
 *
 * Usage:
 *   import { gmTheme } from 'gm-antd';
 *   <ConfigProvider theme={gmTheme}>...</ConfigProvider>
 */
const gmTheme = {
  token: {
    colorPrimary: '#0363ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#f5222d',
    colorInfo: '#0363ff',
  },
  // 不开 cssVar: 在部分消费方(React17 + ConfigProvider)环境下 cssVar 注入不完整,
  // 导致 border-color 等 var(--ant-color-border) 解析为空 → 边框透明。
  // 用默认 cssinjs 直接色值更稳。global.ts 的 var(--ant-color-primary-bg, #c3daff) 有 fallback。
} as const;

export default gmTheme;
