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
    ...rest
  } = props;

  const shouldResize = isResizable && columns && columns.length > 0;
  const result = useTableResizable(
    shouldResize ? columns as any : [],
    components,
  );

  return (
    <AntTable<RecordType>
      ref={ref as any}
      columns={shouldResize ? result.columns : columns}
      components={shouldResize ? result.components : components}
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
