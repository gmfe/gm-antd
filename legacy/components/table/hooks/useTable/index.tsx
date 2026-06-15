/* eslint-disable no-nested-ternary */
import type { TableProps } from 'antd';
import type { ColumnType } from 'antd/es/table';
import type { UseTableDIYOptions } from '../useTableDIY';
import useTableDIY from '../useTableDIY';
import type { UseTableSelectionOptions } from '../useTableSelection';
import useTableSelection from '../useTableSelection';
import useTableResizable from '../useTableResizable';
import useTableTheme from '../useTableTheme';
import type { UseTableVirtualProps } from '../useTableVirtual';
import useTableVirtual from '../useTableVirtual';
import type { UseTableExpandableOptions } from '../useTableExpandable';
import useTableExpandable from '../useTableExpandable';

interface Options<DataType extends { [key: string]: any }> {
  /** UseTableDIY，默认启用 */
  diy?: Omit<UseTableDIYOptions<DataType>, 'columns' | 'rowSelection'> | false;
  /** UseTableSelection, 不传则不启用 */
  selection?: Omit<UseTableSelectionOptions<DataType>, 'dataSource' | 'rowSelection'>;
  /** 是否使用useTableResizable */
  resizable?: boolean;
  /** UseTableVirtual，不传则不启用 */
  virtual?: Omit<UseTableVirtualProps, 'columns' | 'rowSelection' | 'components'>;
  /** 是否使用useTableTheme，默认true */
  theme?: boolean;
  // 下面是通用，吐出后需要传给Table组件
  columns: ColumnType<DataType>[];
  dataSource: TableProps<DataType>['dataSource'];
  rowSelection?: TableProps<DataType>['rowSelection'];
  components?: TableProps<DataType>['components'];
  /** 默认table的expandable属性，不传则不启用useTableExpandable */
  expandable?: UseTableExpandableOptions<DataType>;
}

/** 所有useTableXXX的hook整合，而不是按需引入、使用 */
const useTable = <DataType extends { [key: string]: any }>(options: Options<DataType>) => {
  const {
    diy = {},
    selection,
    theme = true,
    resizable,
    virtual,
    columns,
    dataSource,
    rowSelection,
    components = {},
    expandable,
  } = options;
  const { columns: columnsWithDIY, rowSelection: rowSelectionWithDIY } = useTableDIY({
    ...(diy || {}),
    columns,
    rowSelection,
  });
  const {
    rowSelection: rowSelectionWithSelection,
    BatchActions,
    controller,
    isSelectedAll,
    selectedRowKeys,
    selectedRows,
    components: componentsWithSelection,
    rowKey,
  } = useTableSelection({
    ...(selection || {
      keyName: expandable?.rowKey || '__DEFAULT_TO_DISABLED__',
    }),
    dataSource,
    rowSelection: diy ? rowSelectionWithDIY : {},
    components,
  });
  const { columns: columnsWithResizable, components: componentsWithResizable } = useTableResizable(
    diy ? columnsWithDIY : columns,
    diy ? componentsWithSelection : {},
  );
  const { components: componentsWithTheme } = useTableTheme(
    resizable ? componentsWithResizable : componentsWithSelection,
  );
  const {
    columns: columnsWithVirtual,
    rowSelection: rowSelectionWithVirtual,
    components: componentsWithVirtual,
    scroll,
  } = useTableVirtual({
    // eslint-disable-next-line no-nested-ternary
    columns: resizable ? columnsWithResizable : diy ? columnsWithDIY : columns,
    scroll: virtual?.scroll || {
      x: -1,
      y: -1,
    },
    // eslint-disable-next-line no-nested-ternary
    components: theme ? componentsWithTheme : resizable ? componentsWithResizable : components,
    // eslint-disable-next-line no-nested-ternary
    rowSelection: selection ? rowSelectionWithSelection : diy ? rowSelectionWithDIY : {},
    rowKey,
    onScroll: virtual?.onScroll,
  });

  const [expandableController, newExpandable] = useTableExpandable({
    rowKey: rowKey!,
    ...expandable,
  });

  const features = {
    /** 启用selection后有效 */
    BatchActions,
    /** 启用selection后有效 */
    controller,
    /** 启用selection后有效 */
    isSelectedAll,
    /** 启用selection后有效 */
    selectedRowKeys,
    /** 启用selection后有效 */
    selectedRows,
    expandableController,
  };
  /** 传给Table的 */
  const common = {
    dataSource,
    columns: virtual
      ? columnsWithVirtual
      : resizable
      ? columnsWithResizable
      : diy
      ? columnsWithDIY
      : columns,
    components: virtual
      ? componentsWithVirtual
      : theme
      ? componentsWithTheme
      : resizable
      ? componentsWithResizable
      : selection
      ? componentsWithSelection
      : components,
    rowSelection: virtual
      ? rowSelectionWithVirtual
      : selection
      ? rowSelectionWithSelection
      : diy
      ? rowSelectionWithDIY
      : rowSelection,
    rowKey,
    expandable: expandable ? newExpandable : undefined,
    scroll,
  };
  return [features, common] as [typeof features, typeof common];
};

export default useTable;
