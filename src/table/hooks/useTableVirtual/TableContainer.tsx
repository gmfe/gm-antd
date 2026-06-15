import type { TableProps } from 'antd';
import classNames from 'classnames';
import { noop } from 'lodash';
import type { FC, PropsWithChildren, ThHTMLAttributes } from 'react';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { DEFAULT_HEADER_ROW_HEIGHT } from '.';
import { getStickyStyle } from './util';
import { theme } from 'antd';

interface Props {
  columns: TableProps<any>['columns'];
  components: TableProps<any>['components'];
  rowSelection: TableProps<any>['rowSelection'];
}

const DefaultHeaderWrapper = ({ className, children, ...rest }: PropsWithChildren<any>) => (
  <thead className={classNames(className, 'gm-table-thead', 'default')} {...rest}>
    {children}
  </thead>
);

const DefaultHeaderCell: FC<
  { width: number; onResize?: () => void } & ThHTMLAttributes<HTMLTableHeaderCellElement>
> = ({ className, children, width, style, onResize, ...rest }) => (
  <th
    className={classNames(className, 'gm-table-cell', 'default')}
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
    // tsup dts worker (rollup-plugin-dts) 会把 antd theme 命名空间错误推断为 null
    // (TS2531, 标准 tsc 不报)。运行时 useToken 恒返回对象, 显式标注 theme 结构绕过。
    const { token } = (
      theme as unknown as {
        useToken: () => { token: { colorFillQuaternary: string; colorBorderSecondary: string } };
      }
    ).useToken();

    useImperativeHandle(
      ref,
      () => ({
        setState(state: Props) {
          setState(state);
        },
      }),
      [],
    );

    const THead = components?.header?.wrapper || DefaultHeaderWrapper;
    const Th = components?.header?.cell || DefaultHeaderCell;
    const trWidth = columns?.reduce((pre, item) => pre + Number(item.width || 0), 0) || 0;

    const onResize = (...args: any) => {
      const index = args[2];
      const cb = (columns?.[index]?.onHeaderCell as any)?.()?.onResize as any as Function || noop;
      cb(...args);
    };

    return (
      <div className="gm-virtual-table-container">
        <table
          style={{
            ...style,
            height: Number(style?.height || 0) + DEFAULT_HEADER_ROW_HEIGHT,
            contain: 'strict',
          }}
        >
          {THead && (
            <THead
              className="gm-table-thead gm-use-table-virtual"
              style={{
                position: 'sticky',
                top: 0,
                zIndex: 20,
                whiteSpace: 'nowrap',
                display: 'block',
                backgroundColor: token.colorFillQuaternary,
                borderBottom: `1px solid ${token.colorBorderSecondary}`,
              }}
            >
              <tr style={{ width: trWidth, height: DEFAULT_HEADER_ROW_HEIGHT }}>
                {columns!.map((column, columnIndex) => (
                  <React.Fragment key={column.key || columnIndex}>
                    {columnIndex === 0 && rowSelection?.renderCell && (
                      <Th
                        key="rowSelection"
                        className={classNames(
                          'gm-table-cell gm-virtual-table-cell gm-row-selection',
                          {
                            'gm-virtual-table-cell-fixed-left': rowSelection.fixed === 'left',
                            'gm-virtual-table-cell-fixed-right': rowSelection.fixed === 'right',
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
                      className={classNames(
                        'gm-table-cell gm-virtual-table-cell',
                        column.className,
                        {
                          'gm-virtual-table-cell-fixed-left': column.fixed === 'left',
                          'gm-virtual-table-cell-fixed-right': column.fixed === 'right',
                        },
                      )}
                      width={column.width}
                      onResize={(...args: any) => {
                        onResize(...[...args, columnIndex]);
                      }}
                      style={{
                        ...getStickyStyle(rowSelection, {
                          columns: columns || [],
                          index: columnIndex,
                        }),
                      }}
                    >
                      {column.title}
                    </Th>
                  </React.Fragment>
                ))}
              </tr>
            </THead>
          )}
          <tbody className="gm-table-tbody">{children}</tbody>
        </table>
      </div>
    );
  },
);

export default TableContainer;
