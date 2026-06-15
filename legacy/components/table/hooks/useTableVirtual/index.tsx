import classNames from 'classnames';
import { cloneDeep, get, merge } from 'lodash';
import ResizeObserver from 'rc-resize-observer';
import type { ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import type { ListOnScrollProps } from 'react-window';
import { VariableSizeList } from 'react-window';
import type { Ref } from './TableContainer';
import TableContainer from './TableContainer';
import { getStickyStyle } from './util';
import './index.less';
import type { TableProps } from '../../Table';
import type { ColumnType } from '../../interface';
import Empty from '../../../empty';

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

/** 虚拟列表支持（还不完善） 使用虚拟列表会损失一些功能，比如子母表 每个column必须指定width */
function useTableVirtual({
  columns,
  scroll,
  components,
  rowSelection = {},
  rowKey = 'key',
  onScroll,
}: UseTableVirtualProps): UseTableVirtualProps {
  const [tableWidth, setTableWidth] = useState(0);
  const trWidth = columns!.reduce((pre, item) => pre + Number(item.width || 0), 0);
  const ref = useRef(document.createElement('div'));
  const innerRef = useRef<Ref>();
  useEffect(() => {
    if (!innerRef.current?.setState) return;
    innerRef.current.setState({
      columns,
      components,
      rowSelection,
    });
  }, [columns, scroll, components, rowSelection]);

  const renderVirtualList = (
    rawData: readonly any[],
    // info: {
    //   scrollbarSize: number
    //   ref: React.Ref<{
    //     scrollLeft: number
    //   }>
    //   onScroll: (info: {
    //     currentTarget?: HTMLElement
    //     scrollLeft?: number
    //   }) => void
    // },
  ) => (
    <div className="ant-table ">
      <ResizeObserver onResize={({ width }) => setTableWidth(width)}>
        <div className="resize-observer" />
      </ResizeObserver>
      <VariableSizeList
        className="gm-antd-virtual-table"
        style={{
          paddingBottom: 10,
        }}
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
          // @ts-ignore
          const Row = components?.body?.row || DefaultTR;
          return (
            <Row
              key={rowIndex}
              className="ant-table-row ant-table-row-level-0"
              style={{
                ...style,
                width: trWidth,
                top: Number(style.top) + DEFAULT_HEADER_ROW_HEIGHT, // 留出顶部thead空间
              }}
              data-row-key={row[rowKey]}
            >
              {columns!.map((column, columnIndex) => {
                const key = (column as ColumnType<any>).dataIndex || column.key;
                const value = get(row, key!);
                const content = column.render ? column.render(value, row, rowIndex) : value;
                return (
                  <>
                    {columnIndex === 0 && rowSelection.renderCell && (
                      // TODO： components?.body?.cell
                      <td
                        key="rowSelection"
                        className={classNames(
                          'ant-table-cell gm-antd-virtual-table-cell ant-row-selection',
                          column.className,
                          {
                            'gm-antd-virtual-table-cell-fixed-left': rowSelection.fixed === 'left',
                            'gm-antd-virtual-table-cell-fixed-right': rowSelection.fixed === 'right',
                            'gm-antd-virtual-table-cell-last': columnIndex === columns!.length - 1,
                          },
                        )}
                        style={{
                          minWidth: Number(rowSelection?.columnWidth) || 100,
                          maxWidth: Number(rowSelection?.columnWidth) || 100,
                          height: DEFAULT_ROW_HEIGHT,
                          ...getStickyStyle(rowSelection),
                        }}
                      >
                        {rowSelection.renderCell(false, row, rowIndex, undefined) as ReactNode}
                      </td>
                    )}
                    <td
                      key={column.key || columnIndex}
                      className={classNames('ant-table-cell gm-antd-virtual-table-cell', column.className, {
                        'gm-antd-virtual-table-cell-fixed-left': column.fixed === 'left',
                        'gm-antd-virtual-table-cell-fixed-right': column.fixed === 'right',
                        'gm-antd-virtual-table-cell-last': columnIndex === columns!.length - 1,
                      })}
                      style={{
                        minWidth: column.width,
                        maxWidth: column.width,
                        height: DEFAULT_ROW_HEIGHT,
                        ...getStickyStyle(rowSelection, {
                          columns,
                          index: columnIndex,
                        }),
                      }}
                    >
                      {content}
                    </td>
                  </>
                );
              })}
            </Row>
          );
        }}
      </VariableSizeList>
      {rawData.length === 0 && (
        <Empty
          // className="tw-absolute tw-left-0 tw-top-0 tw-right-0 tw-bottom-0 tw-m-auto tw-w-20 tw-h-20"
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
