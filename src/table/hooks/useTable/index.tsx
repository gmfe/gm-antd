/* eslint-disable no-nested-ternary */
import type { TableProps } from 'antd';
import type { ColumnType } from '../../interface';
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
  diy?: Omit<UseTableDIYOptions<DataType>, 'columns' | 'rowSelection'> | false;
  selection?: Omit<UseTableSelectionOptions<DataType>, 'dataSource' | 'rowSelection'>;
  resizable?: boolean;
  virtual?: Omit<UseTableVirtualProps, 'columns' | 'rowSelection' | 'components'>;
  theme?: boolean;
  columns: ColumnType<DataType>[];
  dataSource: TableProps<DataType>['dataSource'];
  rowSelection?: TableProps<DataType>['rowSelection'];
  components?: TableProps<DataType>['components'];
  expandable?: UseTableExpandableOptions<DataType>;
}

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
    ...(selection || { keyName: expandable?.rowKey || ('__DEFAULT_TO_DISABLED__' as any) }),
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

  // useTableSelection.rowKey 推断为 string | undefined, useTableVirtual/useTableExpandable 需 string;
  // selection 未启用时 rowKey 为 undefined, virtual/expandable 此分支不触发, 类型拓宽无害。
  const rowKeyString = rowKey as string;

  const {
    columns: columnsWithVirtual,
    rowSelection: rowSelectionWithVirtual,
    components: componentsWithVirtual,
    scroll,
  } = useTableVirtual({
    columns: resizable ? columnsWithResizable : diy ? columnsWithDIY : columns,
    scroll: virtual?.scroll || { x: -1, y: -1 },
    components: theme
      ? componentsWithTheme
      : resizable
      ? componentsWithResizable
      : components,
    rowSelection: selection ? rowSelectionWithSelection : diy ? rowSelectionWithDIY : {},
    rowKey: rowKeyString,
    onScroll: virtual?.onScroll,
  });

  const [expandableController, newExpandable] = useTableExpandable({
    rowKey: rowKeyString,
    ...expandable,
  });

  const features = {
    BatchActions,
    controller,
    isSelectedAll,
    selectedRowKeys,
    selectedRows,
    expandableController,
  };

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
