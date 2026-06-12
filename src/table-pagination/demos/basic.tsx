import React, { useState } from 'react';
import { TablePagination } from 'gm-antd';

// Mock paginationResult（实际项目中来自 @gm-common/hooks 的 usePagination）
function useMockPagination() {
  const [paging, setPaging] = useState({ offset: 0, limit: 10, count: 100 });
  return {
    paging,
    loading: false,
    pagination: {
      onChange(newPaging: typeof paging) {
        setPaging(newPaging);
      },
    },
  };
}

export default () => {
  const paginationResult = useMockPagination();

  return (
    <TablePagination
      paginationResult={paginationResult as any}
      showSizeChanger
      showQuickJumper
      left={
        <TablePagination.InfoField
          label="总数"
          value={paginationResult.paging.count}
        />
      }
    />
  );
};
