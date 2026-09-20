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
/* header/body/footer 排除 .base-table-modal(gm-virtual-table diy 弹窗,类名挂在 .ant-modal-wrap 上):
   不排除时本文件规则与业务方 .base-table-modal 归零规则同为 (0,2,0),
   本 style 注入在 head 末尾靠后者胜,会把 diy 弹窗的 body 撑出 24px 内边距。 */
.ant-modal-wrap:not(.base-table-modal) .ant-modal-header {
  padding: 16px 24px;
  margin-bottom: 0;
  border-bottom: 1px solid #f0f0f0;
  border-radius: 8px 8px 0 0;
}
.ant-modal-wrap:not(.base-table-modal) .ant-modal-body {
  padding: 24px;
}
.ant-modal-wrap:not(.base-table-modal) .ant-modal-footer {
  padding: 10px 16px;
  margin-top: 0;
  border-top: 1px solid #f0f0f0;
  border-radius: 0 0 8px 8px;
}
/* 不再强制 .ant-modal-close-icon 尺寸: antd4 fork 时代为对齐视觉加的 width/height/font-size,
   在 antd5 下破坏 .ant-modal-close 的 flex 居中(svg 左偏 2px、缩小)。antd5 原生居中即可。 */

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
/* confirm 弹窗的间距由上方 .ant-modal-body { padding: 24px } 统一承担
   （confirm 无 header/footer，content 已归零）。不要给 body-wrapper 再叠 padding，
   否则与 .ant-modal-body 双层叠加，confirm 内容被撑出 48px 内边距。 */

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

/* Default 按钮(variant-outlined)交互态接管:
   cssinjs 的 .ant-btn-variant-outlined:not(:disabled):hover 会显式把 background
   改写为 defaultHoverBg(colorBgContainer 白),特异性 (0,3,0) 压过 GM/ERP 挂在
   .ant-btn-default (0,2,0) 的灰底 #f2f3f4 → hover 一瞬间灰底变白,表现为
   "hover 后按钮背景色消失"(modal 内反差最明显)。
   以 (0,5,0) 接管:GM 视觉灰底蓝字无边框,hover 保持灰底仅字色变化(antd4 时代行为)。
   注意 danger 按钮(type=default + danger)同样挂 .ant-btn-default 类,必须排除,
   其样式由 .ant-btn-color-dangerous / genDangerousStyle 负责。 */
.ant-btn-default.ant-btn-variant-outlined:not(.ant-btn-dangerous):not(:disabled) {
  color: var(--ant-color-primary, var(--ant-primary-color, var(--gm-color-primary, #0363ff)));
  background-color: #f2f3f4;
  border-color: transparent;
  box-shadow: none;
}
.ant-btn-default.ant-btn-variant-outlined:not(.ant-btn-dangerous):not(:disabled):hover {
  color: var(--ant-color-primary-hover, var(--ant-primary-color-hover, #0363ff));
  background-color: #f2f3f4;
}
.ant-btn-default.ant-btn-variant-outlined:not(.ant-btn-dangerous):not(:disabled):active {
  color: var(--ant-color-primary-active, var(--ant-primary-color-active, #004fcf));
  background-color: #e8eaed;
}

/* antd5 border 补偿: 部分消费方环境(旧 webpack/多 ConfigProvider)下 antd5 colorBorder token 注入为透明,
   导致 Select/DatePicker/Input/Pagination 默认 border-color 透明。
   强制 antd5 默认 colorBorder #d9d9d9,保证 gm-antd 二次封装组件(TableFilter 等)视觉正常。
   注意: default 态补偿特异性 (0,3,0)~(0,4,0) 且本 style 注入在 head 末尾,会压过 antd5 cssinjs
   的 hover/focus 规则(hash 类被 :where() 包裹,特异度贡献 0)——因此下方必须给每个补偿目标
   成套补齐 hover/focus,否则交互态边框被钉死 #d9d9d9 不变色。 */
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
/* 裸 .ant-input(无 affix-wrapper)的 hover/focus 补偿:
   antd5 cssinjs 的 hash class 被 :where() 包裹(特异度贡献 0),其 focus 规则与本文件上面的
   default 态补偿同为 (0,2,0),而本 style 注入在 head 末尾,级联同分靠后者胜 → focus 边框
   被 default 态补偿钉死成 #d9d9d9,表现为"聚焦边框样式消失"。
   与 affix-wrapper 补偿同构,补齐裸 input 的 hover/focus(排除 disabled/error/warning 态)。 */
.ant-input-outlined:not(.ant-input-borderless):not(.ant-input-disabled):not(.ant-input-status-error):not(.ant-input-status-warning):hover {
  border-color: var(--ant-color-primary-hover, var(--ant-primary-color-hover, #2b84ff));
}
.ant-input-outlined:not(.ant-input-borderless):not(.ant-input-disabled):not(.ant-input-status-error):not(.ant-input-status-warning):focus,
.ant-input-outlined:not(.ant-input-borderless):not(.ant-input-disabled):not(.ant-input-status-error):not(.ant-input-status-warning):focus-within {
  border-color: var(--ant-color-primary, var(--ant-primary-color, var(--gm-color-primary, #0363ff)));
  box-shadow: 0 0 0 2px var(--ant-control-outline, rgba(3, 99, 255, 0.16));
}
/* DatePicker/RangePicker(同挂 .ant-picker)的 hover/focus 补偿:
   上方 default 态补偿把 hover/focus 边框钉死 #d9d9d9,此处补齐交互态(排除 borderless/disabled)。 */
.ant-picker-outlined:not(.ant-picker-borderless):not(.ant-picker-disabled):hover {
  border-color: var(--ant-color-primary-hover, var(--ant-primary-color-hover, #2b84ff));
}
.ant-picker-outlined:not(.ant-picker-borderless):not(.ant-picker-disabled).ant-picker-focused,
.ant-picker-outlined:not(.ant-picker-borderless):not(.ant-picker-disabled):focus,
.ant-picker-outlined:not(.ant-picker-borderless):not(.ant-picker-disabled):focus-within {
  border-color: var(--ant-color-primary, var(--ant-primary-color, var(--gm-color-primary, #0363ff)));
  box-shadow: 0 0 0 2px var(--ant-control-outline, rgba(3, 99, 255, 0.16));
}
/* Select 的 hover/focused 补偿(default 补偿同为 (0,4,0),head 末尾注入压过 cssinjs):
   排除 borderless/disabled/customize-input,与 default 补偿的作用域一致。 */
.ant-select-outlined:not(.ant-select-borderless):not(.ant-select-disabled):not(.ant-select-customize-input):hover
  .ant-select-selector {
  border-color: var(--ant-color-primary-hover, var(--ant-primary-color-hover, #2b84ff));
}
.ant-select-focused:not(.ant-select-borderless):not(.ant-select-disabled):not(.ant-select-customize-input)
  .ant-select-selector {
  border-color: var(--ant-color-primary, var(--ant-primary-color, var(--gm-color-primary, #0363ff)));
  box-shadow: 0 0 0 2px var(--ant-control-outline, rgba(3, 99, 255, 0.16));
}
/* InputNumber 的 hover/focus 补偿。 */
.ant-input-number-outlined:not(.ant-input-number-borderless):not(.ant-input-number-disabled):hover {
  border-color: var(--ant-color-primary-hover, var(--ant-primary-color-hover, #2b84ff));
}
.ant-input-number-outlined:not(.ant-input-number-borderless):not(.ant-input-number-disabled).ant-input-number-focused,
.ant-input-number-outlined:not(.ant-input-number-borderless):not(.ant-input-number-disabled):focus-within {
  border-color: var(--ant-color-primary, var(--ant-primary-color, var(--gm-color-primary, #0363ff)));
  box-shadow: 0 0 0 2px var(--ant-control-outline, rgba(3, 99, 255, 0.16));
}
/* Pagination 的 hover/active 补偿: default 补偿的选择器只排除 disabled,
   item-active(选中页码)同样非 disabled,会被一并钉灰,此处一并恢复。 */
.ant-pagination .ant-pagination-item:not(.ant-pagination-item-disabled):hover,
.ant-pagination .ant-pagination-item-active {
  border-color: var(--ant-color-primary, var(--ant-primary-color, var(--gm-color-primary, #0363ff)));
}

/* GmSelect 自定义下拉(DropdownRender)列表项 hover 高亮:
   列表项样式是 inline style(styles.ts),:hover 伪类无法用 inline style 表达,
   旧 antd4 fork 的 .ant-select-dropdown-item:hover 背景在 wrapper 迁移时丢失。
   类名由 DropdownRender.tsx 挂上,disabled 态不高亮。 */
.gm-select-dropdown-item:hover:not(.gm-select-dropdown-item-disabled) {
  background-color: var(--ant-color-fill-quaternary, #f5f5f5);
}

/* GmSelect 自定义下拉弹层宽度兜底:
   DropdownRender 内容有 minWidth 250,但弹层根节点(.ant-select-dropdown)在
   matchWidth 模式下 inline width=触发器宽度,窄触发器(<250)时内容会被
   overflow:hidden 裁剪。配合 compat/Select.tsx 挂的 gm-select-dropdown 类兜底。 */
.gm-select-dropdown {
  min-width: 250px;
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
