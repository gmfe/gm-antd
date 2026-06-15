/* eslint-disable no-unused-vars */
import type { TableProps } from 'antd';
import classNames from 'classnames';
import { noop } from 'lodash';
import type { FC, PropsWithChildren, ThHTMLAttributes } from 'react';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { DEFAULT_HEADER_ROW_HEIGHT } from '.';
import { getStickyStyle } from './util';

interface Props {
  columns: TableProps<any>['columns'];
  components: TableProps<any>['components'];
  rowSelection: TableProps<any>['rowSelection'];
}

const DefaultHeaderWraper = ({ className, children, ...rest }: PropsWithChildren<any>) => (
  <thead className={classNames(className, 'ant-table-thead default')} {...rest}>
    {children}
  </thead>
);

const DefaultHeaderCell: FC<
  {
    width: number;
    onResize?: () => void;
  } & ThHTMLAttributes<HTMLTableHeaderCellElement>
> = ({ className, children, width, style, onResize, ...rest }) => (
  <th
    className={classNames(className, 'ant-table-cell default')}
    style={{
      ...style,
      minWidth: width,
      maxWidth: width,
      display: 'inline-block',
    }}
    {...rest}
  >
    {children}
  </th>
);

export interface Ref {
  setState: (state: Props) => void;
}

const TableContainer = forwardRef<Ref, ThHTMLAttributes<HTMLDivElement>>(
  ({ children, style }, ref) => {
    const [state, setState] = useState<Props>({
      columns: [],
      rowSelection: {},
      components: {},
    });
    const { columns, rowSelection, components } = state;
    useImperativeHandle(
      ref,
      () => ({
        setState(state: Props) {
          setState(state);
        },
      }),
      [],
    );
    // useTableTheme中有定义header.wrapper
    const THead = components?.header?.wrapper || DefaultHeaderWraper;
    // useTableResizable中有定义header.cell
    const Th = components?.header?.cell || DefaultHeaderCell;
    const trWidth = columns?.reduce((pre, item) => pre + Number(item.width || 0), 0) || 0;
    // 与useTableResizable联合使用
    const onResize = (...args: any) => {
      const index = args[2];
      const cb =
        // @ts-ignore onHeaderCell类型声明似乎有问题。
        (columns[index]!.onHeaderCell()?.onResize as any as Function) || noop;
      cb(...args);
    };

    return (
      <div className="gm-antd-virtual-table-container">
        <table
          style={{
            ...style,
            height: Number(style?.height || 0) + DEFAULT_HEADER_ROW_HEIGHT,
            contain: 'strict',
          }}
        >
          {THead && (
            <THead
              className="ant-table-thead use-table-virtual"
              // tw-sticky tw-top-0 tw-z-20 tw-whitespace-nowrap
              style={{
                position: 'sticky',
                top: 0,
                zIndex: 20,
                whiteSpace: 'nowrap',
              }}
            >
              <tr style={{ width: trWidth, height: DEFAULT_HEADER_ROW_HEIGHT }}>
                {columns!.map((column, columnIndex) => (
                  <>
                    {columnIndex === 0 && rowSelection?.renderCell && (
                      <Th
                        key="rowSelection"
                        className={classNames(
                          'ant-table-cell gm-antd-virtual-table-cell ant-row-selection',
                          {
                            'gm-antd-virtual-table-cell-fixed-left': rowSelection.fixed === 'left',
                            'gm-antd-virtual-table-cell-fixed-right': rowSelection.fixed === 'right',
                          },
                        )}
                        width={rowSelection?.columnWidth}
                        style={{
                          ...getStickyStyle(rowSelection),
                          height: DEFAULT_HEADER_ROW_HEIGHT,
                        }}
                      >
                        {rowSelection!.columnTitle}
                      </Th>
                    )}
                    <Th
                      key={column.key || columnIndex}
                      className={classNames('ant-table-cell gm-antd-virtual-table-cell', column.className, {
                        'gm-antd-virtual-table-cell-fixed-left': column.fixed === 'left',
                        'gm-antd-virtual-table-cell-fixed-right': column.fixed === 'right',
                      })}
                      width={column.width}
                      onResize={(...args: any) => {
                        // @ts-ignore
                        onResize(...[...args, columnIndex]);
                      }}
                      style={{
                        ...getStickyStyle(rowSelection, {
                          columns,
                          index: columnIndex,
                        }),
                      }}
                    >
                      {column.title}
                    </Th>
                  </>
                ))}
              </tr>
            </THead>
          )}
          <tbody className="ant-table-tbody">{children}</tbody>
        </table>
      </div>
    );
  },
);

export default TableContainer;
