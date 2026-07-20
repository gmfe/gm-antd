import type { ThemeConfig } from 'antd';

const gmThemeColors = {
  primary: '#0363ff',
  primaryHover: '#0363ff',
  primaryActive: '#004fcf',
  primaryOutline: 'rgba(3, 99, 255, 0.2)',
  primaryOutlineLight: 'rgba(3, 99, 255, 0.12)',
  primaryBg: '#b2d5ff',
  primaryBgLight: '#d7e8fc',
  primaryBgMoreLight: '#edf3f9',
  success: '#52c41a',
  successActive: '#3f9714',
  successOutline: 'rgba(82, 196, 26, 0.2)',
  successBg: '#f6ffed',
  error: '#f5222d',
  errorActive: '#da0a15',
  errorOutline: 'rgba(245, 34, 45, 0.2)',
  errorBg: '#fef1f1',
  dangerBg: '#fa5151',
  dangerActive: '#f91f1f',
  warning: '#faad14',
  warningActive: '#d69005',
  warningOutline: 'rgba(250, 173, 20, 0.2)',
  warningBg: '#fef5eb',
  infoBg: '#edf3f9',
  disabled: 'rgba(0, 0, 0, 0.5)',
} as const;

/**
 * GM theme configuration for antd 5 ConfigProvider.
 * The color values follow GM theme variables in ERP src/css/variable.less,
 * not the native antd 4 generated palette.
 *
 * Usage:
 *   import { gmTheme } from 'gm-antd';
 *   <ConfigProvider theme={gmTheme}>...</ConfigProvider>
 */
const gmTheme: ThemeConfig = {
  token: {
    colorPrimary: gmThemeColors.primary,
    colorPrimaryHover: gmThemeColors.primaryHover,
    colorPrimaryActive: gmThemeColors.primaryActive,
    colorPrimaryBg: gmThemeColors.primaryBg,
    colorPrimaryBgHover: gmThemeColors.primaryBgLight,
    colorPrimaryBorder: gmThemeColors.primary,
    colorPrimaryBorderHover: gmThemeColors.primaryHover,
    colorPrimaryText: gmThemeColors.primary,
    colorPrimaryTextHover: gmThemeColors.primaryHover,
    colorPrimaryTextActive: gmThemeColors.primaryActive,
    colorLink: gmThemeColors.primary,
    colorLinkHover: gmThemeColors.primaryHover,
    colorLinkActive: gmThemeColors.primaryActive,
    colorSuccess: gmThemeColors.success,
    colorSuccessHover: gmThemeColors.success,
    colorSuccessActive: gmThemeColors.successActive,
    colorSuccessBg: gmThemeColors.successBg,
    colorSuccessBorder: gmThemeColors.success,
    colorWarning: gmThemeColors.warning,
    colorWarningHover: gmThemeColors.warning,
    colorWarningActive: gmThemeColors.warningActive,
    colorWarningBg: gmThemeColors.warningBg,
    colorWarningBorder: gmThemeColors.warning,
    colorError: gmThemeColors.error,
    colorErrorHover: gmThemeColors.error,
    colorErrorActive: gmThemeColors.errorActive,
    colorErrorBg: gmThemeColors.errorBg,
    colorErrorBorder: gmThemeColors.error,
    colorInfo: gmThemeColors.primary,
    colorInfoBg: gmThemeColors.infoBg,
    colorInfoBorder: gmThemeColors.primary,
    controlOutline: gmThemeColors.primaryOutline,
    colorWarningOutline: gmThemeColors.warningOutline,
    colorErrorOutline: gmThemeColors.errorOutline,
    colorBorder: '#d9d9d9',
    colorFillQuaternary: '#f5f5f5',
    colorTextDisabled: gmThemeColors.disabled,
    borderRadius: 4,
  },
  components: {
    Modal: {
      borderRadiusLG: 8,
    },
    // 恢复 antd4 Table 行高: antd5 Table 默认 middle size, 用 cellPaddingBlockMD/InlineMD(非 cellPaddingBlock)
    Table: {
      headerBg: '#fafafa',
      headerColor: '#1f1f1f',
      rowHoverBg: '#f5f5f5',
      rowSelectedBg: gmThemeColors.primaryBg,
      rowSelectedHoverBg: gmThemeColors.primaryBg,
      cellPaddingBlock: 16,
      cellPaddingBlockMD: 16,
      cellPaddingInline: 16,
      cellPaddingInlineMD: 16,
    },
  },
  // 不开 cssVar: 在部分消费方(React17 + ConfigProvider)环境下 cssVar 注入不完整,
  // 导致 border-color 等 var(--ant-color-border) 解析为空 → 边框透明。
  // 用默认 cssinjs 直接色值更稳。global.ts 会补齐 GM/antd 变量桥接。
} as const;

const gmLegacyThemeColors = gmThemeColors;

export { gmLegacyThemeColors, gmThemeColors };
export default gmTheme;
