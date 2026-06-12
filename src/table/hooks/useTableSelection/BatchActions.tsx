import classNames from 'classnames';
import type { FC, HTMLAttributes } from 'react';
import React from 'react';
import { Checkbox, Divider, Space } from 'antd';
import type { UseTableSelectionController } from '.';
import useGMLocale from '../../../locale-adapter/useGMLocale';

export interface TableBatchActionsProps extends HTMLAttributes<HTMLDivElement> {
  controller: UseTableSelectionController;
  totalCount?: number;
  stickyTop?: number;
}

const TableBatchActions: FC<TableBatchActionsProps> = ({
  className,
  style,
  children,
  controller,
  totalCount,
  stickyTop,
  ...rest
}) => {
  const { selectedRowKeys, isSelectedTotal, setIsSelectedTotal } = controller;
  const locale = useGMLocale();
  const tableLocale = locale?.Table as Record<string, string> | undefined;

  return (
    <div
      className={classNames(className)}
      style={{
        top: stickyTop,
        height: 52,
        display: 'flex',
        alignItems: 'center',
        padding: '16px 0',
        gap: 10,
        zIndex: 10,
        background: '#fff',
        position: stickyTop !== undefined ? 'sticky' : undefined,
        ...style,
      }}
      {...rest}
    >
      <div
        className="table-batch-actions-content"
        style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
      >
        <Checkbox
          checked={isSelectedTotal}
          disabled={!totalCount}
          onClick={() => {
            setIsSelectedTotal(!isSelectedTotal);
          }}
        >
          {tableLocale?.selectAllPages}
        </Checkbox>
        {selectedRowKeys.length > 0 && (
          <>
            <Divider type="vertical" />
            <Space>
              <div>
                {tableLocale?.selected}
                <span style={{ color: 'var(--ant-color-primary)' }}>
                  {isSelectedTotal ? totalCount : selectedRowKeys.length}{' '}
                </span>
                {tableLocale?.project}
              </div>
            </Space>
          </>
        )}
        {children && <Divider type="vertical" />}
        <div style={{ zIndex: 10, display: 'flex', flex: 1, gap: 8, alignItems: 'center' }}>
          {children}
        </div>
      </div>
    </div>
  );
};
export default TableBatchActions;
