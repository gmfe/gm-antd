import type { TableProps } from '../../Table';

/** 固定列样式 */
// eslint-disable-next-line import/prefer-default-export
export const getStickyStyle = (() => {
  let stickyLeft = 0;
  /** RowSelection列不需要传第二个参数 */
  return (
    rowSelection: TableProps<any>['rowSelection'],
    { columns = [], index }: { columns: TableProps<any>['columns']; index: number } = {
      columns: [],
      index: -1,
    },
  ) => {
    const column = columns[index];
    const sticky = { position: 'sticky', zIndex: 10 };

    // 初始化
    if (index === 0) {
      stickyLeft = 0;
    }

    if (rowSelection?.fixed && !column) {
      return Object.assign(sticky, { left: 0 });
    }
    if (!column?.fixed) return {};

    if (column.fixed === 'left') {
      let left = stickyLeft;
      if (rowSelection?.fixed === 'left') left += Number(rowSelection.columnWidth);
      stickyLeft += Number(column.width);
      return Object.assign(sticky, { left });
    }
    if (column.fixed === 'right') {
      const right = columns
        .slice(index + 1)
        .filter(item => item.fixed === 'right')
        .reduce((pre, cur) => pre + Number(cur.width), 0);
      return Object.assign(sticky, { right });
    }
    return {};
  };
})();
