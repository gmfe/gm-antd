import { CloseOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import type { FC, HTMLAttributes } from 'react';
import React from 'react';
import Button from '../../../button';
import type { UseTableSelectionController } from '.';

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
  const { selectedRowKeys, isSelectedAll, isSelectedTotal } = controller;
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
      {(() => {
        // 默认状态
        if (!controller || !selectedRowKeys.length) {
          return (
            <>
              <div
                // className="tw-text-black-light"
                style={{
                  color: '#333',
                }}
              >
                批量操作:
              </div>
              {children}
            </>
          );
        }
        // 全选状态
        if (isSelectedAll) {
          // 支持选择所有页
          if (totalCount) {
            return (
              <>
                <CloseOutlined
                  // className="tw-cursor-pointer"
                  style={{
                    cursor: 'pointer',
                  }}
                  onClick={() => controller.unselectAll()}
                />
                <Button size="small" type="link" onClick={() => controller.toggleTotal()}>
                  全选{isSelectedTotal ? '当前' : '所有'}页
                </Button>
                <div
                  className="tw-text-black-light"
                  style={{
                    color: '#333',
                  }}
                >
                  已选
                  {isSelectedTotal ? totalCount : selectedRowKeys.length}
                  项:
                </div>
                {children}
              </>
            );
          }
          return (
            <>
              <CloseOutlined
                // className="tw-cursor-pointer"
                style={{
                  cursor: 'pointer',
                }}
                onClick={() => controller.unselectAll()}
              />
              <Button size="small" type="link">
                全选当前页
              </Button>
              <div
                // className="tw-text-black-light"
                style={{
                  color: '#333',
                }}
              >
                已选{selectedRowKeys.length}项:
              </div>
              {children}
            </>
          );
        }
        // 选中但未全选状态

        return (
          <>
            <CloseOutlined
              // className="tw-cursor-pointer"
              style={{
                cursor: 'pointer',
              }}
              onClick={() => controller.unselectAll()}
            />
            <Button size="small" type="link" onClick={() => controller.selectAll()}>
              全选当前页
            </Button>
            <div
              // className="tw-text-black-light"
              style={{
                color: '#333',
              }}
            >
              已选{selectedRowKeys.length}项:
            </div>
            {children}
          </>
        );
      })()}
    </div>
  );
};
export default TableBatchActions;
