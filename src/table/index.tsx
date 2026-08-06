import { Table as AntTable } from 'antd';
import React from 'react';
import type { GMTableProps } from './interface';
import useTableResizable from './hooks/useTableResizable';

function InternalTable<RecordType extends object = any>(
  props: GMTableProps<RecordType>,
  ref: React.Ref<HTMLDivElement>,
) {
  const {
    isResizable = true,
    columns,
    components,
    dataSource,
    scroll,
    ...rest
  } = props;

  const shouldResize = isResizable && columns && columns.length > 0;
  const result = useTableResizable(
    shouldResize ? columns as any : [],
    components,
  );

  // 空数据时不固定表头：rc-table 的 FixedHolder 在固定表头模式下会给表头追加一个 scrollbar
  // 占位列，但空数据时 colgroup 缺少该列的宽度定义（isColGroupEmpty），导致该占位列吸收剩余
  // 宽度撑成大块空白列。空数据时本就无需垂直滚动固定表头，故置空 y 规避。
  const isEmpty = !dataSource || dataSource.length === 0;
  const mergedScroll = isEmpty && scroll ? { ...scroll, y: undefined } : scroll;

  return (
    <AntTable<RecordType>
      ref={ref as any}
      columns={shouldResize ? result.columns : columns}
      components={shouldResize ? result.components : components}
      dataSource={dataSource}
      scroll={mergedScroll}
      {...rest}
    />
  );
}

const ForwardTable = React.forwardRef(InternalTable) as <RecordType extends object = any>(
  props: React.PropsWithChildren<GMTableProps<RecordType>> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement;

const Table = ForwardTable as typeof ForwardTable & {
  SELECTION_COLUMN: typeof AntTable.SELECTION_COLUMN;
  EXPAND_COLUMN: typeof AntTable.EXPAND_COLUMN;
  SELECTION_ALL: typeof AntTable.SELECTION_ALL;
  SELECTION_INVERT: typeof AntTable.SELECTION_INVERT;
  SELECTION_NONE: typeof AntTable.SELECTION_NONE;
  Column: typeof AntTable.Column;
  ColumnGroup: typeof AntTable.ColumnGroup;
  Summary: typeof AntTable.Summary;
};

Table.SELECTION_COLUMN = AntTable.SELECTION_COLUMN;
Table.EXPAND_COLUMN = AntTable.EXPAND_COLUMN;
Table.SELECTION_ALL = AntTable.SELECTION_ALL;
Table.SELECTION_INVERT = AntTable.SELECTION_INVERT;
Table.SELECTION_NONE = AntTable.SELECTION_NONE;
Table.Column = AntTable.Column;
Table.ColumnGroup = AntTable.ColumnGroup;
Table.Summary = AntTable.Summary;

export default Table;
