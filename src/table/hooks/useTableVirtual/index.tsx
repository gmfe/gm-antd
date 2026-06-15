import classNames from 'classnames';
import { cloneDeep, get, merge } from 'lodash';
import ResizeObserver from 'rc-resize-observer';
import type { ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import type { ListOnScrollProps, VariableSizeListProps } from 'react-window';
import { VariableSizeList } from 'react-window';
import { Empty, theme } from 'antd';
import type { Ref } from './TableContainer';
import TableContainer from './TableContainer';
import { getStickyStyle } from './util';
import type { TableProps } from '../../interface';
import type { ColumnType } from '../../interface';

export const DEFAULT_ROW_HEIGHT = 48;
export const DEFAULT_HEADER_ROW_HEIGHT = 50;

export interface UseTableVirtualProps {
  columns: TableProps<any>['columns'];
  scroll: {
    x: string | number | true;
    y: number;
  };
  components?: TableProps<any>['components'];
  rowSelection?: TableProps<any>['rowSelection'];
  rowKey?: string;
  onScroll?: (props: ListOnScrollProps & { atBottom: boolean }) => any;
}

const DefaultTR = (props: any = {}) => <tr {...props} />;

// react-window 组件实例类型与 @types/react 18 的 refs 不兼容(第三方库类型滞后), 做类型转换
const VariableSizeListFC = VariableSizeList as unknown as React.FC<VariableSizeListProps>;

function useTableVirtual({
  columns,
  scroll,
  components,
  rowSelection = {},
  rowKey = 'key',
  onScroll,
}: UseTableVirtualProps): UseTableVirtualProps {
  const [tableWidth, setTableWidth] = useState(0);
  const trWidth = (columns || []).reduce((pre, item) => pre + Number(item.width || 0), 0);
  const ref = useRef(document.createElement('div'));
  const innerRef = useRef<Ref>();
  // tsup dts worker (rollup-plugin-dts) 会把 antd theme 命名空间错误推断为 null
  // (TS2531, 标准 tsc 不报)。运行时 useToken 恒返回对象, 显式标注 theme 结构绕过。
  const { token } = (
    theme as unknown as {
      useToken: () => { token: { colorBorderSecondary: string } };
    }
  ).useToken();

  useEffect(() => {
    if (!innerRef.current?.setState) return;
    innerRef.current.setState({
      columns,
      components,
      rowSelection,
    });
  }, [columns, scroll, components, rowSelection]);

  const renderVirtualList = (rawData: readonly any[]) => (
    <div>
      <ResizeObserver onResize={({ width }) => setTableWidth(width)}>
        <div className="resize-observer" />
      </ResizeObserver>
      <VariableSizeListFC
        className="gm-virtual-table"
        style={{ paddingBottom: 10 }}
        itemCount={rawData.length}
        height={(DEFAULT_HEADER_ROW_HEIGHT + scroll!.y) as number}
        itemSize={() => DEFAULT_ROW_HEIGHT}
        itemData={{ rawData }}
        innerElementType={TableContainer}
        // @ts-ignore
        ref={ref}
        innerRef={innerRef}
        width={tableWidth!}
        onScroll={data => {
          onScroll?.({
            ...data,
            atBottom: data.scrollOffset > DEFAULT_ROW_HEIGHT * rawData.length - scroll.y,
          });
        }}
      >
        {props => {
          const { index: rowIndex, style } = props;
          const row = rawData[rowIndex];
          const Row = (components?.body as any)?.row || DefaultTR;
          return (
            <Row
              key={rowIndex}
              className="gm-table-row gm-table-row-level-0"
              style={{
                ...style,
                width: trWidth,
                top: Number(style.top) + DEFAULT_HEADER_ROW_HEIGHT,
                minWeight: '100%',
                borderBottom: `1px solid ${token.colorBorderSecondary}`,
              }}
              data-row-key={row[rowKey]}
            >
              {columns!.map((column, columnIndex) => {
                const key = (column as ColumnType<any>).dataIndex || column.key;
                const value = get(row, key!);
                const content = column.render ? column.render(value, row, rowIndex) : value;
                return (
                  <React.Fragment key={column.key || columnIndex}>
                    {columnIndex === 0 && rowSelection.renderCell && (
                      <td
                        key="rowSelection"
                        className={classNames(
                          'gm-table-cell gm-virtual-table-cell gm-row-selection',
                          column.className,
                          {
                            'gm-virtual-table-cell-fixed-left': rowSelection.fixed === 'left',
                            'gm-virtual-table-cell-fixed-right': rowSelection.fixed === 'right',
                            'gm-virtual-table-cell-last': columnIndex === columns!.length - 1,
                          },
                        )}
                        style={{
                          minWidth: Number(rowSelection?.columnWidth) || 100,
                          maxWidth: Number(rowSelection?.columnWidth) || 100,
                          height: DEFAULT_ROW_HEIGHT,
                          boxSizing: 'border-box',
                          padding: rowSelection.fixed ? '0 16px' : '0',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          ...getStickyStyle(rowSelection),
                        }}
                      >
                        {rowSelection.renderCell(false, row, rowIndex, undefined) as ReactNode}
                      </td>
                    )}
                    <td
                      key={column.key || columnIndex}
                      className={classNames(
                        'gm-table-cell gm-virtual-table-cell',
                        column.className,
                        {
                          'gm-virtual-table-cell-fixed-left': column.fixed === 'left',
                          'gm-virtual-table-cell-fixed-right': column.fixed === 'right',
                          'gm-virtual-table-cell-last': columnIndex === columns!.length - 1,
                        },
                      )}
                      style={{
                        minWidth: column.width,
                        maxWidth: column.width,
                        height: DEFAULT_ROW_HEIGHT,
                        boxSizing: 'border-box',
                        marginBottom: 1,
                        padding: '0 16px',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        wordWrap: 'break-word',
                        wordBreak: 'break-all',
                        ...getStickyStyle(rowSelection, {
                          columns: columns as any[],
                          index: columnIndex,
                        }),
                      }}
                    >
                      {content}
                    </td>
                  </React.Fragment>
                );
              })}
            </Row>
          );
        }}
      </VariableSizeListFC>
      {rawData.length === 0 && (
        <Empty
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            margin: 'auto',
            width: 100,
            height: 100,
          }}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}
    </div>
  );

  return {
    columns,
    scroll,
    components: merge(cloneDeep(components), {
      body: renderVirtualList,
      header: {
        wrapper: () => null,
      },
    }),
    rowSelection,
  };
}

export default useTableVirtual;
