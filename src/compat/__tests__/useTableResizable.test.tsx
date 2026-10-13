import React from 'react';
import { act, render } from '@testing-library/react';
import type { ColumnsType } from 'antd/es/table';
import useTableResizable from '../../table/hooks/useTableResizable';

interface Row {
  key: string;
  name: string;
  age: number;
}

const baseColumns: ColumnsType<Row> = [
  { title: '姓名', dataIndex: 'name', key: 'name', width: 200, fixed: 'left' },
  { title: '年龄', dataIndex: 'age', key: 'age', width: 120 },
  { title: '地址', key: 'address', width: 300 },
];

type Result = ReturnType<typeof useTableResizable<Row>>;

const renderHook = (columns: ColumnsType<Row>, options?: Parameters<typeof useTableResizable<Row>>[2]) => {
  let latest: Result | undefined;
  const Harness = () => {
    latest = useTableResizable(columns, undefined, options);
    return null;
  };
  render(<Harness />);
  return () => latest as Result;
};

const fireResize = (result: Result, columnKey: string, width: number) => {
  const column = result.columns.find(item => (item as { key?: string }).key === columnKey);
  const headerProps = column?.onHeaderCell?.('' as any, 0 as any) as
    | { onResize: (e: unknown, data: { size: { width: number } }) => void }
    | undefined;
  if (!headerProps) {
    throw new Error(`column ${columnKey} 不可拖拽`);
  }
  act(() => {
    headerProps.onResize(null, { size: { width } });
  });
};

describe('useTableResizable', () => {
  it('默认 fixed 列与最后一列不可拖拽, 普通列可拖拽', () => {
    const getResult = renderHook(baseColumns);
    const columns = getResult().columns as Array<{ key?: string; onHeaderCell?: unknown }>;

    expect(columns.map(item => item.key)).toEqual(['name', 'age', 'address']);
    expect(columns[0]!.onHeaderCell).toBeUndefined();
    expect(columns[1]!.onHeaderCell).toBeDefined();
    expect(columns[2]!.onHeaderCell).toBeUndefined();
  });

  it('options.fixed 放开 fixed 列拖拽', () => {
    const getResult = renderHook(baseColumns, { fixed: true });
    const columns = getResult().columns as Array<{ key?: string; onHeaderCell?: unknown }>;

    expect(columns[0]!.onHeaderCell).toBeDefined();
    // 未传 lastColumn, 最后一列仍不可拖拽
    expect(columns[2]!.onHeaderCell).toBeUndefined();
  });

  it('options.lastColumn 放开最后一列拖拽', () => {
    const getResult = renderHook(baseColumns, { lastColumn: true });
    const columns = getResult().columns as Array<{ key?: string; onHeaderCell?: unknown }>;

    // 未传 fixed, fixed 列仍不可拖拽
    expect(columns[0]!.onHeaderCell).toBeUndefined();
    expect(columns[2]!.onHeaderCell).toBeDefined();
  });

  it('PLACEHOLDER 列被过滤, 不参与拖拽', () => {
    const getResult = renderHook([...baseColumns, { key: 'PLACEHOLDER', width: 0 }]);
    const columns = getResult().columns as Array<{ key?: string }>;

    expect(columns.some(item => item.key === 'PLACEHOLDER')).toBe(false);
  });

  it('拖拽回调更新列宽, 且不能拖窄到原始宽度以下', () => {
    const getResult = renderHook(baseColumns);

    fireResize(getResult(), 'age', 80);
    const ageColumn = getResult().columns.find(
      item => (item as { key?: string }).key === 'age',
    ) as { width?: number };
    expect(ageColumn.width).toBe(120);

    fireResize(getResult(), 'age', 400);
    const widened = getResult().columns.find(
      item => (item as { key?: string }).key === 'age',
    ) as { width?: number };
    expect(widened.width).toBe(400);
  });
});
