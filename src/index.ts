// gm-antd — antd 5 wrapper layer
export * from 'antd';

// Overridden components
export { default as Button } from './button';
export { default as Select } from './select';

// Custom components
export { default as Icon } from './icon';
export { default as Sortable } from './sortable';
export { default as ContentWrapper } from './content-wrapper';
export { default as ContentWrapperContext } from './content-wrapper/context';

// Locale
export { default as gmZhCN } from './locale/zh_CN';
export { default as useGMLocale } from './locale-adapter/useGMLocale';

// Styles
export { default as gmTheme } from './styles/theme';
export { GMGlobalStyle } from './styles/global';

// Version
export const version = '2.0.0';
