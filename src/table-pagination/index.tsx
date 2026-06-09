import classNames from 'classnames';
import React from 'react';
import type { ReactNode } from 'react';
import type { PaginationProps } from 'antd';
import { Pagination, Typography } from 'antd';
import type { UsePaginationResult } from '@gm-common/hooks';
import InfoField from './components/InfoField';
import useGMLocale from '../locale-adapter/useGMLocale';

export interface TablePaginationProps extends PaginationProps {
  paginationResult: UsePaginationResult;
  left?: ReactNode;
  onPageChange?: () => void;
}

export const TABLE_PAGINATION_HEIGHT = 52;

interface Components {
  InfoField: typeof InfoField;
}

const TablePagination: React.FC<TablePaginationProps> & Components = ({
  className,
  left,
  paginationResult,
  onPageChange,
  ...rest
}) => {
  const locale = useGMLocale();
  const tableLocale = locale?.Table as Record<string, string> | undefined;

  return (
    <div
      className={classNames('table-pagination', className)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 10,
        paddingBottom: 10,
        position: 'sticky',
        bottom: 0,
        background: 'white',
        zIndex: 10,
      }}
    >
      <div
        className="table-pagination-left"
        style={{ display: 'flex', alignItems: 'center' }}
      >
        {left}
      </div>
      <div>
        <Pagination
          current={
            paginationResult.paging.offset / paginationResult.paging.limit + 1
          }
          total={paginationResult.paging.count}
          pageSize={paginationResult.paging.limit}
          disabled={paginationResult.loading}
          onChange={(page, pageSize) => {
            paginationResult.pagination.onChange({
              ...paginationResult.paging,
              offset: (page - 1) * pageSize,
            });
            onPageChange && onPageChange();
          }}
          onShowSizeChange={(_, size) => {
            paginationResult.pagination.onChange({
              ...paginationResult.paging,
              offset: 0,
              limit: size,
            });
            onPageChange && onPageChange();
          }}
          showTotal={total => {
            if (!(paginationResult.paging as any).need_count) return;
            return (
              <Typography.Text type="secondary">
                {total}
                {tableLocale?.items}
              </Typography.Text>
            );
          }}
          {...rest}
        />
      </div>
    </div>
  );
};

TablePagination.InfoField = InfoField;
export default TablePagination;
