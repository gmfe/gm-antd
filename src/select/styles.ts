import type { CSSProperties } from 'react';

export const dropdownContainerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
};

export const dropdownContentStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  minWidth: 250,
  maxHeight: 300,
  overflowY: 'auto',
};

export const dropdownSectionStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  borderTop: '1px solid #f0f0f0',
  padding: '4px 8px',
};

export const sectionTitleStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  color: 'rgba(0, 0, 0, 0.45)',
  padding: '4px 8px',
};

export const sectionContentStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
};

export const dropdownGroupStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  marginBottom: 8,
};

export const dropdownGroupLabelStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  color: 'rgba(0, 0, 0, 0.45)',
  marginBottom: 6,
  paddingLeft: 4,
};

export const dropdownGroupContentStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  paddingLeft: 8,
};

export const dropdownItemStyle = (isSelected: boolean, isDisabled: boolean): CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  padding: '6px 8px',
  cursor: isDisabled ? 'not-allowed' : 'pointer',
  borderRadius: 4,
  transition: 'background-color 0.2s',
  ...(isSelected && {
    color: 'var(--ant-color-primary, var(--gm-color-primary, #0363ff))',
  }),
  ...(isDisabled && { opacity: 0.5 }),
});

export const dropdownItemLabelStyle: CSSProperties = {
  flex: 1,
  fontSize: 14,
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
};

export const checkIconStyle: CSSProperties = {
  color: 'var(--ant-color-primary, var(--gm-color-primary, #0363ff))',
  fontSize: 14,
  marginRight: 8,
};

export const footerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  borderTop: '1px solid #f0f0f0',
  padding: '4px 8px',
  justifyContent: 'space-between',
  alignItems: 'center',
};
