import type { TableProps as AntTableProps } from 'antd';

// Re-export antd 5 Table types (from rc-table through antd)
export type {
  TableProps,
} from 'antd';

export type {
  ColumnType,
  ColumnGroupType,
  ColumnsType,
  ExpandableConfig,
  GetRowKey,
} from 'rc-table/lib/interface';

export type {
  TableRowSelection,
  SorterResult,
  FilterValue,
  TablePaginationConfig,
} from 'antd/es/table/interface';

// GM-specific locale extensions
export interface TableLocale {
  filterTitle?: string;
  filterConfirm?: React.ReactNode;
  filterReset?: React.ReactNode;
  filterEmptyText?: React.ReactNode;
  filterCheckall?: React.ReactNode;
  filterSearchPlaceholder?: string;
  emptyText?: React.ReactNode | (() => React.ReactNode);
  selectAll?: React.ReactNode;
  selectNone?: React.ReactNode;
  selectInvert?: React.ReactNode;
  selectionAll?: React.ReactNode;
  sortTitle?: string;
  expand?: string;
  collapse?: string;
  triggerDesc?: string;
  triggerAsc?: string;
  cancelSort?: string;
  headerSettings?: string;
  optionalField?: string;
  defaultGrouping?: string;
  theCurrentlySelectedField?: string;
  cancel?: string;
  save?: string;
  selectAllPages?: string;
  selected?: string;
  project?: string;
  open?: string;
  close?: string;
  search?: string;
  pleaseSelect?: string;
  pleaseEnter?: string;
  allFilteringCriteria?: string;
  saveSettings?: string;
  items?: string;
}

// useTableDIY config
export interface ConfigItem {
  defaultShow?: boolean;
  disable?: boolean;
  name?: string;
  group?: string;
}

// GM Table props (extends antd 5 TableProps)
export interface GMTableProps<RecordType = any> extends AntTableProps<RecordType> {
  isResizable?: boolean;
}

// Shared column key utility type
export type Key = React.Key;
