import classNames from 'classnames';
import type { FC, HTMLAttributes } from 'react';
import React from 'react';
import Checkbox from '../../../checkbox';
import Divider from '../../../divider';
import Space from '../../../space';
import type { UseTableSelectionController } from '.';
import { useLocaleReceiver } from '../../../locale-provider/LocaleReceiver';

export interface TableBatchActionsProps extends HTMLAttributes<HTMLDivElement> {
  controller: UseTableSelectionController;
  /** 指定值后，在BatchActions中可以切换”全选当前页“/”全选所有页“, */
  totalCount?: number;
  /** 指定固定顶部的位置，不指定不固定 */
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
  const [TableLocale] = useLocaleReceiver('Table');
  return (
    <div
      className={classNames(
        // 'tw-flex tw-items-center tw-py-2 tw-gap-2 tw-font-family-regular tw-z-10 tw-bg-white',
        className,
        // {
        //   'tw-sticky': stickyTop !== undefined,
        // },
      )}
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
      <div className="table-batch-actions-content">
        <Checkbox
          checked={isSelectedTotal}
          disabled={!totalCount}
          onClick={() => {
            setIsSelectedTotal(!isSelectedTotal);
          }}
          className="table-batch-actions-content-checkbox"
        >
          {TableLocale?.selectAllPages}
        </Checkbox>
        {selectedRowKeys.length > 0 && (
          <>
            <Divider type="vertical" />
            <Space>
              <div>
                {TableLocale?.selected}
                <span className="primary">
                  {isSelectedTotal ? totalCount : selectedRowKeys.length}{' '}
                </span>
                {TableLocale?.project}
              </div>
            </Space>
          </>
        )}
        {children && <Divider type="vertical" />}
        <div className="table-batch-actions-content-btns">{children}</div>
      </div>
    </div>
  );
};
export default TableBatchActions;
