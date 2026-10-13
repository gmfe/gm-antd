import type { TableProps as AntTableProps } from 'antd';

// Re-export antd 5 Table types (from rc-table through antd)
export type {
  TableProps,
} from 'antd';

// antd5 公共入口仅以 TableColumnType/TableColumnGroupType/TableColumnsType 别名导出列类型,
// 且未导出 ExpandableConfig/GetRowKey/TableRowSelection/SorterResult/FilterValue;
// antd/es/table/interface 是 antd table 模块的公共接口文件, 汇总了全部上述类型, 暂用该深路径(无等价公共替代)。
export type {
  ColumnType,
  ColumnGroupType,
  ColumnsType,
  ExpandableConfig,
  GetRowKey,
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

// 列宽拖拽限制的放开配置(默认 fixed 列与最后一列不可拖拽, 保持历史行为)
export interface TableResizableConfig {
  /** fixed 列是否可拖拽, 默认 false */
  fixed?: boolean;
  /** 最后一列是否可拖拽, 默认 false */
  lastColumn?: boolean;
}

// GM Table props (extends antd 5 TableProps)
export interface GMTableProps<RecordType = any> extends AntTableProps<RecordType> {
  /** 是否启用列宽拖拽; 传对象时可放开对应列形态的拖拽限制 */
  isResizable?: boolean | TableResizableConfig;
}

// Shared column key utility type
export type Key = React.Key;
