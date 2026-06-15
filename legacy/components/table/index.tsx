import Table, { TablePaginationConfig, TableProps } from './Table';

export { ColumnProps } from './Column';
export { ColumnGroupType, ColumnsType, ColumnType } from './interface';
export { TableProps, TablePaginationConfig };
export { default as useTableDIY } from './hooks/useTableDIY';
export { default as useTableSelection } from './hooks/useTableSelection';
export { default as useTableTheme } from './hooks/useTableTheme';
export { default as useTableExpandable } from './hooks/useTableExpandable';
export { default as useTableVirtual } from './hooks/useTableVirtual';
export { default as useTable } from './hooks/useTable';
export { default as useTableResizable } from './hooks/useTableResizable';

export default Table;
