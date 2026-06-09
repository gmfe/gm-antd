import React, { useEffect } from 'react';

const globalCSS = `
/* GM global component overrides - replaces reset_component.less */

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
  border-top: 1px solid #e9e9e9;
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

/* Modal confirm title bold */
.ant-modal-confirm-body .ant-modal-confirm-title {
  font-weight: 600;
}

/* Table: thead/tbody height 48px */
.ant-table .ant-table-thead tr {
  height: 48px;
}
.ant-table .ant-table-thead tr th {
  height: 48px;
  padding: 0 16px;
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
  background-color: #c3daff;
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
  color: var(--ant-color-primary);
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
  background-color: none;
}
`;

let injected = false;

/**
 * React component that injects GM global CSS overrides into the document head.
 * Renders nothing. Only injects once across all mounts.
 *
 * Usage:
 *   import { GMGlobalStyle } from 'gm-antd';
 *   <GMGlobalStyle />
 */
const GMGlobalStyle: React.FC = () => {
  useEffect(() => {
    if (injected || typeof document === 'undefined') return;
    const style = document.createElement('style');
    style.setAttribute('data-gm-antd', 'global');
    style.textContent = globalCSS;
    document.head.appendChild(style);
    injected = true;
  }, []);
  return null;
};

export { GMGlobalStyle, globalCSS };
export default GMGlobalStyle;
