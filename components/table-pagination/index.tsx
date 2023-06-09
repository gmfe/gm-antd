import classNames from 'classnames';
import React from 'react';
import type { FC, ReactNode } from 'react';
import type { PaginationProps } from 'antd';
import type { UsePaginationResult } from '@gm-common/hooks';
import { Pagination, Typography } from '../index';
import InfoField from './components/InfoField';
import './index.less';

export interface TablePaginationProps extends PaginationProps {
  paginationResult: UsePaginationResult;
  left?: ReactNode;
  /** 翻页页码回调 */
  onPageChange?: () => void;
}

export const TABLE_PAGINATION_HEIGHT = 52;

interface Components {
  InfoField: typeof InfoField;
}

const TablePagination: FC<TablePaginationProps> & Components = ({
  className,
  left,
  paginationResult,
  onPageChange,
  ...rest
}) => (
  <div
    className={classNames('table-pagination', className)}
    //  tw-flex tw-items-center tw-justify-between tw-py-2 tw-sticky tw-bottom-0 tw-bg-white tw-z-10
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
      //  tw-flex tw-items-center tw-divide-x tw-divide-y-0 tw-divide-solid tw-divide-gray-light tw-gap-3
      style={{
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {left}
    </div>
    <div>
      <Pagination
        current={
          paginationResult.paging.offset / paginationResult.paging.limit + 1 // 下标始于1
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
          paginationResult.paging.offset = 0;
          paginationResult.paging.limit = size;
          // paginationResult.pagination.onChange({
          //   ...paginationResult.paging,
          //   limit: size,
          // })
          // onPageChange && onPageChange()
        }}
        // eslint-disable-next-line react/no-unstable-nested-components
        showTotal={total => {
          if (!paginationResult.paging.need_count) return;
          return <Typography.Text type="secondary">{total}个条目</Typography.Text>;
        }}
        {...rest}
      />
    </div>
  </div>
);

TablePagination.InfoField = InfoField;
export default TablePagination;
