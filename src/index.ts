// 注册 dayjs 中文 locale: antd5 DatePicker(rc-picker) 的星期/月份表头取自 dayjs locale,
// antd5 zhCN locale 不带 shortWeekDays, 回退到 dayjs weekdaysMin()。gm-antd 与 antd5/rc-picker
// 共享同一个 dayjs 实例(均在 gm-antd 的 node_modules 下), 在此注册后 DatePicker 下拉才能显示
// 中文星期(一二三四五六日)与月份(2月), 否则消费方即使设了 dayjs.locale 也因实例不同而无效。
import 'dayjs/locale/zh-cn';

// gm-antd — antd 5 wrapper layer
// 1. re-export antd 5。垫片组件随后用「显式 export 同名覆盖」(TS 规则:显式 export 胜出)。
export * from 'antd';

// 2. 兼容垫片(同名覆盖 antd 值导出,全吸收 v4→v5 breaking changes)
export {
  Modal,
  Drawer,
  Tooltip,
  Popover,
  Dropdown,
  Popconfirm,
  Input,
  InputNumber,
  Cascader,
  TreeSelect,
  AutoComplete,
  Mentions,
  Select,
  message,
  Tabs,
  Menu,
  DatePicker,
  TimePicker,
} from './compat';
// 2b. 加宽后的 props 类型(同名 export type 覆盖 export * 的 antd 类型)
export type { ModalProps, DrawerProps, TooltipProps, PopoverProps, DropdownProps, PopconfirmProps } from './compat';
export type { InputProps, InputNumberProps } from './compat';
export type { CascaderProps, TreeSelectProps, AutoCompleteProps, MentionsProps } from './compat';
export type { GmSelectProps } from './compat';
export type { GmSelectProps as SelectProps } from './compat'; // 加宽版 SelectProps 覆盖 antd
export type { TabsProps, MenuProps } from './compat';
export type { CompatDatePickerProps as DatePickerProps } from './compat';
export type { CompatTimePickerProps as TimePickerProps } from './compat';
export type { CompatTimeRangePickerProps as TimeRangePickerProps } from './compat';

// 3. GM 增强组件
export { default as Button } from './button';
export { default as Table } from './table';
// 3b. Upload: 给 antd5 原生 Upload 补回旧 gm-pc 的 Upload.open 命令式弹窗 API
export { Upload } from './upload';

// 4. 自定义组件
export { default as Icon } from './icon';
export { default as Sortable } from './sortable';
export type { SortableDataItem } from './sortable/types';
export { default as ContentWrapper, ContentWrapperContext } from './content-wrapper';
export { default as TableFilter, TableFilterContext, SearchBarContext } from './table-filter';
export type { FieldItem, TableFilterProps } from './table-filter';
export { default as TablePagination, TABLE_PAGINATION_HEIGHT } from './table-pagination';

// 5. Table hooks
export { default as useTableExpandable } from './table/hooks/useTableExpandable';
export { default as useTableResizable } from './table/hooks/useTableResizable';
export { default as useTableTheme } from './table/hooks/useTableTheme';
export { default as useTableDIY } from './table/hooks/useTableDIY';
export { default as useTableSelection } from './table/hooks/useTableSelection';
// BatchActions: useTableSelection 配套批量操作组件（业务深路径 antd/(lib|es)/table/hooks/useTableSelection/BatchActions）
export { default as BatchActions } from './table/hooks/useTableSelection/BatchActions';
export { default as useTableVirtual } from './table/hooks/useTableVirtual';
export { default as useTable } from './table/hooks/useTable';

// 6. Table styles(全局 CSS for ::before overrides)
import './table/styles/table-hooks.css';

// 7. Locale / 样式
export { default as gmZhCN } from './locale/zh_CN';
export { default as useGMLocale } from './locale-adapter/useGMLocale';
export { default as gmTheme } from './styles/theme';
export { GMGlobalStyle } from './styles/global';

export const version = '2.0.0';
