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
  cssVar: true,
  hashed: true,
} as const;

export default gmTheme;
