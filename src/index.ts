// gm-antd — antd 5 wrapper layer
export * from 'antd';

// Overridden components
export { default as Button } from './button';
export { default as Select } from './select';
export { default as Table } from './table';

// Custom components
export { default as Icon } from './icon';
export { default as Sortable } from './sortable';
export { default as ContentWrapper } from './content-wrapper';
export { default as ContentWrapperContext } from './content-wrapper/context';
export { default as TableFilter, TableFilterContext, SearchBarContext } from './table-filter';
export type { FieldItem, TableFilterProps } from './table-filter';
export { default as TablePagination } from './table-pagination';
export { TABLE_PAGINATION_HEIGHT } from './table-pagination';

// Table hooks
export { default as useTableExpandable } from './table/hooks/useTableExpandable';
export { default as useTableResizable } from './table/hooks/useTableResizable';
export { default as useTableTheme } from './table/hooks/useTableTheme';
export { default as useTableDIY } from './table/hooks/useTableDIY';
export { default as useTableSelection } from './table/hooks/useTableSelection';
export { default as useTableVirtual } from './table/hooks/useTableVirtual';

// Table styles (global CSS for ::before overrides)
import './table/styles/table-hooks.css';

// Locale
export { default as gmZhCN } from './locale/zh_CN';
export { default as useGMLocale } from './locale-adapter/useGMLocale';

// Styles
export { default as gmTheme } from './styles/theme';
export { GMGlobalStyle } from './styles/global';

// Version
export const version = '2.0.0';
