import React, { useEffect, useRef, useState } from 'react';
import type { TableProps } from 'antd';
import { flatten } from 'lodash';
import { useWindowSize } from 'react-use';
import { createPortal } from 'react-dom';
import type { ColumnType } from '../../interface';
import type { Groups } from './DiyPanel';
import DiyPanel from './DiyPanel';
import { getRawColumns, getSortedColumns, initGroups } from './util';
import useGMLocale from '../../../locale-adapter/useGMLocale';

export interface ConfigItem {
  defaultShow?: boolean;
  disable?: boolean;
  name?: string;
  group?: string;
}

export interface UseTableDIYOptions<DataType extends { [key: string]: any }> {
  columns: ColumnType<DataType>[];
  rowSelection?: TableProps<DataType>['rowSelection'];
  cacheID?: string;
  config?: { [columnKey: string]: ConfigItem };
  shouldUpdateKey?: any;
  inDeep?: boolean;
  onUpdateColumns?: (columns: ColumnType<DataType>[]) => void;
}

export interface UseTableDIYResult<DataType extends { [key: string]: any }> {
  rowSelection: TableProps<DataType>['rowSelection'];
  columns: ColumnType<DataType>[];
}

const SVGSettingIcon: React.FC<any> = props => (
  <svg {...props} x="0px" y="0px" viewBox="0 0 16 16">
    <g>
      <path
        d="M15.4,13.1H7.9c-0.3-1-1.1-1.7-2.2-1.7c-1.1,0-2,0.7-2.2,1.7H0.6c-0.3,0-0.6,0.3-0.6,0.6 c0,0.3,0.3,0.6,0.6,0.6h2.9c0.3,1,1.1,1.7,2.2,1.7c1.1,0,2-0.7,2.2-1.7h7.5c0.3,0,0.6-0.3,0.6-0.6C16,13.4,15.7,13.1,15.4,13.1 L15.4,13.1z M5.7,14.9c-0.6,0-1.2-0.5-1.2-1.2c0-0.6,0.5-1.2,1.2-1.2s1.2,0.5,1.2,1.2C6.9,14.4,6.4,14.9,5.7,14.9L5.7,14.9z M5.7,14.9"
      />
      <path
        d="M15.4,7.4h-2.9c-0.3-1-1.1-1.7-2.2-1.7c-1.1,0-2,0.7-2.2,1.7H0.6C0.3,7.4,0,7.7,0,8c0,0.3,0.3,0.6,0.6,0.6 h7.5c0.3,1,1.1,1.7,2.2,1.7c1.1,0,2-0.7,2.2-1.7h2.9C15.7,8.6,16,8.3,16,8C16,7.7,15.7,7.4,15.4,7.4L15.4,7.4z M10.3,9.2 C9.6,9.2,9.1,8.6,9.1,8c0-0.6,0.5-1.2,1.2-1.2c0.6,0,1.2,0.5,1.2,1.2C11.4,8.6,10.9,9.2,10.3,9.2L10.3,9.2z M10.3,9.2"
      />
      <path
        d="M0.6,2.9h2.9c0.3,1,1.1,1.7,2.2,1.7c1.1,0,2-0.7,2.2-1.7h7.5c0.3,0,0.6-0.3,0.6-0.6c0-0.3-0.3-0.6-0.6-0.6 H7.9C7.7,0.7,6.8,0,5.7,0c-1.1,0-2,0.7-2.2,1.7H0.6C0.3,1.7,0,2,0,2.3C0,2.6,0.3,2.9,0.6,2.9L0.6,2.9z M5.7,1.1 c0.6,0,1.2,0.5,1.2,1.2c0,0.6-0.5,1.2-1.2,1.2S4.6,2.9,4.6,2.3C4.6,1.6,5.1,1.1,5.7,1.1L5.7,1.1z M5.7,1.1"
      />
    </g>
  </svg>
);

const ColumnTitle = (
  options: UseTableDIYOptions<any> & {
    cacheID: string;
    onUpdate: (columns: ColumnType<any>[]) => void;
  },
) => {
  const { cacheID, rowSelection, columns = [], config = {}, onUpdate } = options;
  const [open, setOpen] = useState(false);
  const [groups, setGroups] = useState<Groups>([]);
  const locale = useGMLocale();
  const tableLocale = locale?.Table as Record<string, string> | undefined;

  const ref = useRef(document.createElement('div'));
  const size = useWindowSize();
  const [maxSize, setMaxSize] = useState({ maxWidth: 0, maxHeight: 0 });

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      setGroups(initGroups({ columns, config, cacheID }));
    } else {
      document.body.style.overflow = 'initial';
    }
    return () => {
      document.body.style.overflow = 'initial';
    };
  }, [open]);

  const rawColumns = getRawColumns(columns);
  useEffect(() => setGroups(initGroups({ columns, config, cacheID })), [rawColumns]);
  useEffect(() => {
    const rect = ref.current.getBoundingClientRect();
    setMaxSize({
      maxWidth: innerWidth - rect.x - 100,
      maxHeight: innerHeight - rect.y,
    });
  }, [size]);

  return (
    <div className="use-table-diy" ref={ref} style={{ display: 'flex', alignItems: 'center' }}>
      {rowSelection?.columnTitle}
      {createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            display: open ? 'flex' : 'none',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.4)',
            zIndex: 1000,
          }}
        >
          <DiyPanel
            style={{ width: 900, maxWidth: '70vw', background: 'white', boxShadow: '0 20px 6px -4px rgb(0 0 0 / 0.12), 0 20px 16px 0 rgb(0 0 0 / 0.08), 0 20px 28px 8px rgb(0 0 0 / 0.05)' }}
            cacheID={cacheID}
            groups={groups}
            maxHeight={maxSize.maxHeight}
            onChange={g => setGroups(g)}
            onReset={() => {
              const groups = initGroups({
                columns,
                config,
                cacheID: 'WITH_NO_CACHE',
              });
              setGroups(groups);
              const checkedColumns = flatten(Object.values(groups.map(item => item.list))).filter(
                item => item.state.checked,
              );
              const sortedColumns = getSortedColumns(checkedColumns).map(item => item.column);
              setTimeout(() => onUpdate(sortedColumns), 0);
            }}
            onCancel={() => {
              const groups = initGroups({
                columns,
                config,
                cacheID,
              });
              setGroups(groups);
              const checkedColumns = flatten(Object.values(groups.map(item => item.list))).filter(
                item => item.state.checked,
              );
              const sortedColumns = getSortedColumns(checkedColumns).map(item => item.column);
              setTimeout(() => onUpdate(sortedColumns), 0);
              setOpen(false);
            }}
            onFinish={columns => {
              setOpen(false);
              setTimeout(() => onUpdate(columns), 0);
            }}
          />
        </div>,
        document.body,
      )}
      <div
        className="use-table-diy-setting-icon"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 50 }}
        title={tableLocale?.headerSettings}
      >
        <SVGSettingIcon
          style={{ cursor: 'pointer', display: 'inline-block', width: 14, height: 14 }}
          onClick={() => {
            setOpen(true);
          }}
        />
      </div>
    </div>
  );
};

const useTableDIY = <DataType extends { [key: string]: any }>(
  options: UseTableDIYOptions<DataType>,
): UseTableDIYResult<DataType> => {
  const {
    rowSelection,
    columns,
    config,
    shouldUpdateKey,
    inDeep = false,
    onUpdateColumns,
  } = options;
  const cacheID = options.cacheID ?? new URL(location.href.replace('/#', '')).pathname;

  const [newColumns, setNewColumns] = useState(columns);

  const shouldUpdateKeyRef = useRef(shouldUpdateKey);
  const previousRawColumns = useRef<string | null>(null);

  const updateColumns = (columns: ColumnType<DataType>[]) => {
    const groups = initGroups({ columns, config, cacheID });
    const checkedColumns = flatten(Object.values(groups.map(item => item.list))).filter(
      item => item.state.checked,
    );
    const sortedColumns = getSortedColumns(checkedColumns).map(item => item.column);
    setNewColumns(sortedColumns);
  };

  useEffect(() => {
    if (shouldUpdateKeyRef.current !== shouldUpdateKey) {
      shouldUpdateKeyRef.current = shouldUpdateKey;
      updateColumns(columns);
    }
  });

  useEffect(() => {
    if (inDeep) {
      updateColumns(columns);
      return;
    }
    const rawColumns = getRawColumns(columns);
    if (rawColumns === previousRawColumns.current) {
      return;
    }
    previousRawColumns.current = rawColumns;
    updateColumns(columns);
  }, [columns]);

  const newRowSelection: TableProps<any>['rowSelection'] = {
    ...rowSelection,
    fixed: 'left',
    columnWidth: ((rowSelection?.columnWidth as number) || 0) + 50,
    columnTitle: (
      <ColumnTitle
        {...options}
        cacheID={cacheID}
        columns={columns}
        onUpdate={clms => {
          setNewColumns(clms);
          onUpdateColumns?.(clms);
        }}
      />
    ),
    renderCell(value, record, index, node) {
      return (
        <div className="use-table-diy-cell" style={{ display: 'flex' }}>
          <>
            {rowSelection?.renderCell && rowSelection.renderCell(value, record, index, node)}
            <div className="use-table-diy-cell-no" style={{ width: 50, textAlign: 'center' }}>
              {index + 1}
            </div>
          </>
        </div>
      );
    },
  };

  const fixedRightIndex = newColumns.findIndex(
    (item, i) =>
      item.fixed === 'right' &&
      (newColumns.slice(i + 1).length === 0 ||
        !newColumns.slice(i + 1).find(item => item.fixed === 'right')),
  );
  const newColumnsWithPlaceholder = newColumns.slice();
  const lastNormalColumn = newColumns
    .slice()
    .reverse()
    .find(item => !item.fixed);
  if (lastNormalColumn?.width) {
    if (fixedRightIndex > -1) {
      newColumnsWithPlaceholder.splice(fixedRightIndex, 0, {
        key: 'PLACEHOLDER',
        className: 'placeholder',
      });
    } else {
      newColumnsWithPlaceholder.push({
        key: 'PLACEHOLDER',
        className: 'placeholder',
      });
    }
  }

  return {
    rowSelection: newRowSelection,
    columns: newColumnsWithPlaceholder,
  };
};
export default useTableDIY;
