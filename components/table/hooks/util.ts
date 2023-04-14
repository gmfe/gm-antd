import type { ColumnType } from '../interface';

// eslint-disable-next-line import/prefer-default-export
export const getColumnKey = (column: ColumnType<any>) => {
  // eslint-disable-next-line no-nested-ternary
  const key = Array.isArray(column.dataIndex)
    ? column.dataIndex.join('.')
    : typeof column.dataIndex === 'string'
    ? column.dataIndex
    : column.key;
  if (!key)
    console.log(
      column,
      '需要 key，如果已经设置了唯一的 dataIndex，可以忽略这个属性, [https://ant.design/components/table-cn/#Column]',
    );
  return key;
};
