import React, { useLayoutEffect } from 'react';
import { gmThemeColors } from './theme';

const globalCSS = `
/* GM global component overrides - replaces reset_component.less */

/* GM theme variable bridge for legacy antd4-style CSS vars and antd5 token vars. */
:root,
html {
  --gm-color-primary: ${gmThemeColors.primary};
  --gm-color-bg-primary: ${gmThemeColors.primary};
  --gm-color-bg-primary-light: ${gmThemeColors.primaryBgLight};
  --gm-color-bg-primary-more-light: ${gmThemeColors.primaryBgMoreLight};
  --gm-color-primary-active: ${gmThemeColors.primaryActive};
  --gm-color-bg-primary-active: ${gmThemeColors.primaryActive};
  --gm-color-border-primary: ${gmThemeColors.primary};
  --gm-color-table-td-active: ${gmThemeColors.primaryBg};
  --gm-color-success: ${gmThemeColors.success};
  --gm-color-danger: ${gmThemeColors.error};
  --gm-color-link: ${gmThemeColors.primary};
  --gm-color-bg-success: ${gmThemeColors.success};
  --gm-color-bg-danger: ${gmThemeColors.dangerBg};
  --gm-color-success-active: ${gmThemeColors.successActive};
  --gm-color-danger-active: ${gmThemeColors.dangerActive};
  --gm-color-bg-success-active: ${gmThemeColors.successActive};
  --gm-color-bg-danger-active: ${gmThemeColors.dangerActive};
  --ant-primary-color: ${gmThemeColors.primary};
  --ant-primary-color-hover: ${gmThemeColors.primaryHover};
  --ant-primary-color-active: ${gmThemeColors.primaryActive};
  --ant-primary-color-outline: ${gmThemeColors.primaryOutline};
  --ant-primary-1: ${gmThemeColors.primaryBgMoreLight};
  --ant-primary-2: ${gmThemeColors.primaryBgLight};
  --ant-primary-3: ${gmThemeColors.primaryBg};
  --ant-primary-4: ${gmThemeColors.primary};
  --ant-primary-5: ${gmThemeColors.primary};
  --ant-primary-6: ${gmThemeColors.primary};
  --ant-primary-7: ${gmThemeColors.primaryActive};
  --ant-primary-color-deprecated-pure: ${gmThemeColors.primaryActive};
  --ant-primary-color-deprecated-l-35: ${gmThemeColors.primaryBgMoreLight};
  --ant-primary-color-deprecated-l-20: ${gmThemeColors.primaryBgLight};
  --ant-primary-color-deprecated-t-20: ${gmThemeColors.primary};
  --ant-primary-color-deprecated-t-50: ${gmThemeColors.primaryBgLight};
  --ant-primary-color-deprecated-f-12: ${gmThemeColors.primaryOutlineLight};
  --ant-primary-color-active-deprecated-f-30: rgba(178, 213, 255, 0.3);
  --ant-primary-color-active-deprecated-d-02: ${gmThemeColors.primaryBgLight};
  --ant-success-color: ${gmThemeColors.success};
  --ant-success-color-hover: ${gmThemeColors.success};
  --ant-success-color-active: ${gmThemeColors.successActive};
  --ant-success-color-outline: ${gmThemeColors.successOutline};
  --ant-success-color-deprecated-bg: ${gmThemeColors.successBg};
  --ant-success-color-deprecated-border: ${gmThemeColors.success};
  --ant-error-color: ${gmThemeColors.error};
  --ant-error-color-hover: ${gmThemeColors.error};
  --ant-error-color-active: ${gmThemeColors.errorActive};
  --ant-error-color-outline: ${gmThemeColors.errorOutline};
  --ant-error-color-deprecated-bg: ${gmThemeColors.errorBg};
  --ant-error-color-deprecated-border: ${gmThemeColors.error};
  --ant-warning-color: ${gmThemeColors.warning};
  --ant-warning-color-hover: ${gmThemeColors.warning};
  --ant-warning-color-active: ${gmThemeColors.warningActive};
  --ant-warning-color-outline: ${gmThemeColors.warningOutline};
  --ant-warning-color-deprecated-bg: ${gmThemeColors.warningBg};
  --ant-warning-color-deprecated-border: ${gmThemeColors.warning};
  --ant-info-color: ${gmThemeColors.primary};
  --ant-info-color-deprecated-bg: ${gmThemeColors.infoBg};
  --ant-info-color-deprecated-border: ${gmThemeColors.primary};
  --ant-disabled-color: ${gmThemeColors.disabled};
  --ant-color-primary: ${gmThemeColors.primary};
  --ant-color-primary-hover: ${gmThemeColors.primaryHover};
  --ant-color-primary-active: ${gmThemeColors.primaryActive};
  --ant-color-primary-bg: ${gmThemeColors.primaryBg};
  --ant-color-primary-bg-hover: ${gmThemeColors.primaryBgLight};
  --ant-color-primary-border: ${gmThemeColors.primary};
  --ant-color-primary-border-hover: ${gmThemeColors.primaryHover};
  --ant-color-primary-text: ${gmThemeColors.primary};
  --ant-color-primary-text-hover: ${gmThemeColors.primaryHover};
  --ant-color-primary-text-active: ${gmThemeColors.primaryActive};
  --ant-color-link: ${gmThemeColors.primary};
  --ant-color-link-hover: ${gmThemeColors.primaryHover};
  --ant-color-link-active: ${gmThemeColors.primaryActive};
  --ant-color-success: ${gmThemeColors.success};
  --ant-color-success-bg: ${gmThemeColors.successBg};
  --ant-color-success-border: ${gmThemeColors.success};
  --ant-color-warning: ${gmThemeColors.warning};
  --ant-color-warning-bg: ${gmThemeColors.warningBg};
  --ant-color-warning-border: ${gmThemeColors.warning};
  --ant-color-error: ${gmThemeColors.error};
  --ant-color-error-bg: ${gmThemeColors.errorBg};
  --ant-color-error-border: ${gmThemeColors.error};
  --ant-color-info: ${gmThemeColors.primary};
  --ant-color-info-bg: ${gmThemeColors.infoBg};
  --ant-color-info-border: ${gmThemeColors.primary};
  --ant-control-outline: ${gmThemeColors.primaryOutline};
  --ant-color-border: #d9d9d9;
  --ant-color-fill-quaternary: #f5f5f5;
  --ant-color-text-disabled: ${gmThemeColors.disabled};
}

/* Button: remove shadows */
.ant-btn,
.ant-btn-primary {
  text-shadow: none;
  box-shadow: none;
}

/* Modal/Drawer title */
.ant-modal-title,
.ant-drawer-title {
  position: relative;
  color: rgba(0, 0, 0, 0.85);
  font-weight: 600;
}
.ant-modal .ant-modal-content {
  padding: 0;
  overflow: hidden;
  border-radius: 8px;
}
.ant-modal .ant-modal-header {
  padding: 16px 24px;
  margin-bottom: 0;
  border-bottom: 1px solid #f0f0f0;
  border-radius: 8px 8px 0 0;
}
.ant-modal .ant-modal-body {
  padding: 24px;
}
.ant-modal .ant-modal-footer {
  padding: 10px 16px;
  margin-top: 0;
  border-top: 1px solid #f0f0f0;
  border-radius: 0 0 8px 8px;
}
.ant-modal .ant-modal-close-icon {
  width: 16px;
  height: 16px;
  font-size: 12px;
}

/* GM footer positioning */
.ant-modal .gm-modal-footer,
.ant-drawer .gm-drawer-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 999;
  width: 100%;
  padding: 10px 16px;
  text-align: right;
  background-color: #fff;
  border-top: 1px solid #f0f0f0;
}
.ant-modal .gm-modal-footer .ant-btn,
.ant-drawer .gm-drawer-footer .ant-btn {
  margin-right: 12px;
}
.ant-modal .gm-modal-footer .ant-btn-primary,
.ant-drawer .gm-drawer-footer .ant-btn-primary {
  margin-right: 0;
}

/* Tabs background */
.ant-tabs {
  background-color: #fff;
}

/* Card title */
.ant-card-head-title {
  font-weight: 600;
}

/* Card body padding */
.ant-card-body {
  padding: 16px 24px;
}

/* Modal confirm dangerous button */
.ant-modal-confirm-btns .ant-btn-dangerous {
  color: #fff;
  background-color: #ff4d4f;
}

/* Modal confirm content word break */
.ant-modal-confirm-content {
  word-break: break-all;
}
.ant-modal-confirm .ant-modal-confirm-body-wrapper {
  padding: 24px;
}

/* Modal confirm title bold */
.ant-modal-confirm-body .ant-modal-confirm-title {
  font-weight: 600;
}
.ant-modal-confirm .ant-btn {
  border: none;
  border-radius: 4px;
}
.ant-modal-confirm .ant-btn-default {
  color: var(--ant-primary-color, var(--gm-color-primary, #0363ff));
  background-color: #f2f3f4;
}

/* Table: thead/tbody height 48px */
.ant-table .ant-table-thead tr {
  height: 48px;
}
.ant-table .ant-table-thead tr th {
  height: 48px;
  padding: 0 16px;
  color: #1f1f1f;
  font-weight: 500;
  background-color: #fafafa;
}
.ant-table .ant-table-tbody > tr.ant-table-row {
  height: 48px;
  min-height: 48px;
  background-color: white;
}
.ant-table .ant-table-tbody > tr.ant-table-row td {
  padding: 0 16px;
}
.ant-table .ant-table-tbody > tr.ant-table-row:hover > td {
  background-color: #f5f5f5;
}
.ant-table .ant-table-tbody > tr.ant-table-row-selected > td {
  background-color: var(--gm-color-table-td-active, #b2d5ff);
}

/* Tabs title 16px */
.ant-tabs-tab-btn {
  font-size: 16px;
}

/* Form: item with help margin, input-number 100% width */
.ant-form .ant-form-item-with-help {
  margin-bottom: 24px;
}
.ant-form .ant-input-number-group-wrapper {
  width: 100%;
}

/* Message z-index */
.ant-message {
  z-index: 1050;
}

/* Lightgrey button variant */
.ant-btn.lightgrey {
  color: var(--ant-color-primary, var(--gm-color-primary, #0363ff));
  background-color: #f2f3f4;
  border-style: none;
}
.ant-btn.lightgrey:hover {
  background-color: rgba(220, 233, 255);
}
.ant-btn.lightgrey[disabled] {
  color: rgba(0, 0, 0, 0.25);
  background-color: #f5f5f5;
}
.ant-btn.lightgrey[disabled]:hover {
  background-color: transparent;
}

/* antd5 border 补偿: 部分消费方环境(旧 webpack/多 ConfigProvider)下 antd5 colorBorder token 注入为透明,
   导致 Select/DatePicker/Input/Pagination 默认 border-color 透明(只 default 状态,hover/focus 由 cssinjs 正常覆盖)。
   强制 antd5 默认 colorBorder #d9d9d9,保证 gm-antd 二次封装组件(TableFilter 等)视觉正常。 */
.ant-select-outlined:not(.ant-select-borderless):not(.ant-select-disabled):not(.ant-select-customize-input) .ant-select-selector,
.ant-picker-outlined:not(.ant-picker-borderless):not(.ant-picker-disabled),
.ant-input-outlined:not(.ant-input-borderless),
.ant-input-affix-wrapper.ant-input-outlined:not(.ant-input-borderless):not(.ant-input-affix-wrapper-disabled):not(.ant-input-affix-wrapper-status-error):not(.ant-input-affix-wrapper-status-warning),
.ant-input-number-outlined:not(.ant-input-number-borderless),
.ant-pagination .ant-pagination-item:not(.ant-pagination-item-disabled) {
  border-color: #d9d9d9;
}
.ant-input-affix-wrapper.ant-input-outlined:not(.ant-input-borderless):not(.ant-input-affix-wrapper-disabled):not(.ant-input-affix-wrapper-status-error):not(.ant-input-affix-wrapper-status-warning):hover {
  border-color: var(--ant-color-primary-hover, var(--ant-primary-color-hover, #2b84ff));
}
.ant-input-affix-wrapper.ant-input-outlined:not(.ant-input-borderless):not(.ant-input-affix-wrapper-disabled):not(.ant-input-affix-wrapper-status-error):not(.ant-input-affix-wrapper-status-warning).ant-input-affix-wrapper-focused,
.ant-input-affix-wrapper.ant-input-outlined:not(.ant-input-borderless):not(.ant-input-affix-wrapper-disabled):not(.ant-input-affix-wrapper-status-error):not(.ant-input-affix-wrapper-status-warning):focus,
.ant-input-affix-wrapper.ant-input-outlined:not(.ant-input-borderless):not(.ant-input-affix-wrapper-disabled):not(.ant-input-affix-wrapper-status-error):not(.ant-input-affix-wrapper-status-warning):focus-within {
  border-color: var(--ant-color-primary, var(--ant-primary-color, var(--gm-color-primary, #0363ff)));
  box-shadow: 0 0 0 2px var(--ant-control-outline, rgba(3, 99, 255, 0.16));
}

/* Select/Cascader/TreeSelect(共用 .ant-select 根节点)作为 flex item 时,min-width:auto 会让
   自身宽度被内容(tag)撑大;maxTagCount=responsive 的 rc-overflow 又随容器宽度反复重算,
   形成"tag 显示→撑宽→重算→tag 收起→缩回→重算"的反馈循环,导致选中项高频闪动(60fps)。
   统一 min-width: 0 使组件宽度只由布局决定、不被内容顶开,打断该循环。
   对非 flex 场景 min-width:auto 本就等效 0,无副作用。 */
.ant-select {
  min-width: 0;
}
`;

const GM_GLOBAL_STYLE_ATTR = 'data-gm-antd';
const GM_GLOBAL_STYLE_VALUE = 'global';

/**
 * React component that injects GM global CSS overrides into the document head.
 * Renders nothing. Reuses one style tag and refreshes its content on mount.
 *
 * Usage:
 *   import { GMGlobalStyle } from 'gm-antd';
 *   <GMGlobalStyle />
 */
const GMGlobalStyle: React.FC = () => {
  useLayoutEffect(() => {
    if (typeof document === 'undefined') return;

    const selector = `style[${GM_GLOBAL_STYLE_ATTR}="${GM_GLOBAL_STYLE_VALUE}"]`;
    let style = document.querySelector<HTMLStyleElement>(selector);
    if (!style) {
      style = document.createElement('style');
      style.setAttribute(GM_GLOBAL_STYLE_ATTR, GM_GLOBAL_STYLE_VALUE);
      document.head.appendChild(style);
    }
    if (style.textContent !== globalCSS) {
      style.textContent = globalCSS;
    }
  }, []);
  return null;
};

export { GMGlobalStyle, globalCSS };
export default GMGlobalStyle;
