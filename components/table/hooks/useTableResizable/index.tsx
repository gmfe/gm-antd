import { clamp, cloneDeep, merge, pick } from 'lodash';
import type { SyntheticEvent } from 'react';
import React, { useState, useRef, useMemo, useEffect } from 'react';
import type { ResizeCallbackData } from 'react-resizable';
import { Resizable } from 'react-resizable';
import type { ColumnType } from '../../interface';
import type { TableProps } from '../../Table';
import { getColumnKey } from '../util';
import './index.less';

const DEFAULT_COLUMNS_HEAD_WIDTH = 100;
const MIN_COLUMN_WIDTH = 150;
const MAX_COLUMN_WIDTH = 999;

export interface UseTableResizableResult<DataType extends { [key: string]: any }> {
  columns: ColumnType<DataType>[];
  components: TableProps<DataType>['components'];
}

const clearSelection = () => {
  const _document = document as any;
  if (window.getSelection) {
    const selection = window.getSelection();
    if (selection) {
      if (selection.empty) {
        // Chrome
        selection.empty();
      } else if (selection.removeAllRanges) {
        // Firefox
        selection.removeAllRanges();
      }
    }
  } else if (_document?.selection && _document?.selection.empty) {
    // IE
    (_document.selection as any).empty();
  }
};

const ResizableTitle = (
  props: React.HTMLAttributes<any> & {
    onResize: (e: React.SyntheticEvent<Element>, data: ResizeCallbackData, rect?: any) => void;
    width: number;
  },
) => {
  const { onResize, width: w, style, ...restProps } = props;
  const [width, setWidth] = useState(w || DEFAULT_COLUMNS_HEAD_WIDTH);
  const ref = useRef<HTMLTableHeaderCellElement | null>(null)

  useEffect(() => {
    if (w) {
      return
    }
    if (ref.current) {
      const rect = ref.current?.getBoundingClientRect()
      setWidth(rect?.width || w)
    }
  }, [])


  const _handleResize = (e: SyntheticEvent<Element>, data: ResizeCallbackData) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    onResize && onResize(e, data);
    setWidth(data.size.width);
  };

  return (
    <Resizable
      width={width}
      height={0}
      handle={
        <span
          className="antd-table-resizable"
          onClick={e => {
            e.stopPropagation();
          }}
        />
      }
      onResize={_handleResize}
      draggableOpts={{
        enableUserSelectHack: false,
        onMouseDown: () => {
          // 处理Windows Chrome 和 Edge 松开鼠标依然能拖动的问题
          clearSelection();
        },
      }}
    >
      <th
        ref={ref}
        style={{
          ...style,
          minWidth: w,
          maxWidth: w,
        }}
        {...restProps}
      />
    </Resizable>
  );
};

/**
 * 表格列拖拽宽度支持
 *
 * 要求columns中必须有width属性
 */
const useTableResizable = <DataType extends { [key: string]: any }>(
  // eslint-disable-next-line default-param-last
  columns: ColumnType<DataType>[] = [],
  components?: TableProps<DataType>['components'],
): UseTableResizableResult<DataType> => {
  const [width, setWidth] = useState<{ [key: string]: number }>({});
  const originColumns = useRef(columns.map(column => pick(column, ['width', 'dataIndex', 'key'])));
  const newComponents: TableProps<any>['components'] = useMemo(
    () =>
      merge(cloneDeep(components), {
        header: {
          cell: ResizableTitle,
        },
      }),
    [components],
  );

  const handleResize =
    (col: ColumnType<DataType>) =>
    (_: SyntheticEvent<Element>, { size }: ResizeCallbackData) => {
      const originCol = originColumns.current?.find(
        item => getColumnKey(item) === getColumnKey(col),
      );
     
      setWidth(width => ({
        ...width,
        [getColumnKey(col)!]: clamp(
          size.width,
          parseFloat((originCol?.width as string) || (MIN_COLUMN_WIDTH as unknown as string)),
          MAX_COLUMN_WIDTH,
        )
      }));
    };

  return {
    columns: columns!.filter((_item) => _item.key !== "PLACEHOLDER").map((col, index) => {
      const onHeaderCell = () => ({
        width: width[getColumnKey(col)!] || col.width || MIN_COLUMN_WIDTH ,
        onResize: handleResize(col) as any,
      });
      return {
        ...col,
        width: width[getColumnKey(col)!] || col.width || MIN_COLUMN_WIDTH,
        // 固定列、最后一列不支持拖拽
        onHeaderCell: col.fixed || index === columns.length - 1 ? undefined : onHeaderCell,
      };
    }),
    components: newComponents,
  };
};
export default useTableResizable;
