import type { FC } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import type { ButtonProps, TableProps } from 'antd';
import { cloneDeep, merge } from 'lodash';
import classNames from 'classnames';
import type { TableBatchActionsProps } from './BatchActions';
import TableBatchActions from './BatchActions';
import './index.less';
import Checkbox from '../../../checkbox/Checkbox';
import Button from '../../../button/button';

export interface UseTableSelectionOptions<
  DataType extends { [key: string]: any } = any,
  ChildrenColumnName extends string = 'children',
> {
  /** Table的dataSource */
  dataSource: TableProps<DataType>['dataSource'];
  /** Table的rowSelection */
  rowSelection: TableProps<DataType>['rowSelection'];
  /** Table的components */
  components?: TableProps<DataType>['components'];
  /** 指定选中用的key */
  keyName: string | number;
  /** 指定值后，在BatchActions中可以切换”全选当前页“/”全选所有页“, */
  totalCount?: number;
  /**
   * 树形数据的展示模式，默认为`all`。（注意一级数据如果没有children要给空数组而不是undefined）
   *
   * - `parent` 模式下只展示一级数据的checkbox，`selectedRows`/`selectedRowKeys`里不会包含children;
   * - `child` 模式下一级数据和children都展示checkbox，但是`selectedRows`/`selectedRowKeys`里不会包含一级数据，一级数据仅做汇总;
   * - `all` 模式下一级数据和children都展示checkbox，`selectedRows`/`selectedRowKeys`里包含一级数据和children;
   */
  mode?: 'all' | 'parent' | 'child';
  /** 指定children数据在哪个字段下，默认为`children` */
  childrenColumnName?: ChildrenColumnName;
  /** 禁用特定数据的勾选 */
  disabled?: <IsParent extends boolean = false>(
    record: IsParent extends true ? DataType : DataType[ChildrenColumnName][0],
    /** 是否是一级数据 */
    isParent?: IsParent,
  ) => boolean;
  /** Cell的 选中/取消 事件，不被 全选/取消 触发 */
  onSelect?: (record: DataType, selected: boolean) => void;
}

export interface UseTableSelectionResult<DataType> {
  /** Table的rowSelection */
  rowSelection: TableProps<DataType>['rowSelection'];
  /** Table的rowKey */
  rowKey?: string;
  /** Table的components */
  components: TableProps<DataType>['components'];
  /** 选中项keys */
  selectedRowKeys: Array<string | number>;
  /** 选中项rows */
  selectedRows: DataType[];
  /** 全选totalCount状态 */
  isSelectedAll: boolean;
  controller: UseTableSelectionController;
  /** 批量操作UI */
  BatchActions: FC<Omit<TableBatchActionsProps, 'dataSource' | 'controller' | 'totalCount'>> & {
    /** 固定样式的批量操作按钮 */
    Button: FC<ButtonProps>;
    /** 组件高度 */
    height: number;
  };
}

export interface UseTableSelectionController<DataType = any> {
  dataSource: TableProps<DataType>['dataSource'];
  isSelectedTotal: boolean;
  isSelectedAll: boolean;
  selectedRowKeys: (string | number)[];
  selectedRows: TableProps<DataType>['dataSource'];
  /** 是否勾选 */
  isChecked(record: DataType): boolean;
  /** 全选当前页 */
  selectAll(): void;
  /** 取消全选当前页 */
  unselectAll(): void;
  /** 勾选/取消 */
  toggle(record: DataType): void;
  /** 全选所有页/全选当前页 */
  toggleTotal(): void;
  /** 重置 */
  reset(): void;
  /** 设置已选择的 key */
  setSelected: React.Dispatch<React.SetStateAction<(string | number)[]>>;
  /** 设置全选所有页 */
  setIsSelectedTotal(value: boolean): void;
}

/** 表格多选支持 */
function useTableSelection<DataType extends { [key: string]: any }>(
  options: UseTableSelectionOptions<DataType>,
): UseTableSelectionResult<DataType> {
  const {
    dataSource = [],
    keyName,
    totalCount,
    rowSelection = {},
    components,
    childrenColumnName = 'children',
    mode = 'all',
    disabled = () => false,
    onSelect,
  } = options;
  const [selected, setSelected] = useState<Array<string | number>>([]);
  /** 是否全选所有页 */
  const [isSelectedTotal, setIsSelectedTotal] = useState(false);

  /** 允许勾选的数据 */
  const enabledData = (() => {
    const parents = dataSource.filter(record => !disabled(record));
    const children: DataType[] = [];
    if (mode !== 'parent') {
      dataSource.forEach(record => {
        const cb = (child: DataType) => {
          if (!disabled(child)) children.push(child);
          if (child.children) child.children.forEach(cb);
        };
        record[childrenColumnName]?.forEach(cb);
      });
    }
    return parents.concat(children);
  })();

  const selectedResult = useMemo(() => {
    switch (mode) {
      case 'all':
        return selected;
      case 'parent':
        // 过滤掉children
        return selected.filter(id => {
          const cb = (item: DataType) => {
            if (item[childrenColumnName]) {
              return !item[childrenColumnName].find((child: DataType) => child[keyName] === id);
            }
            return true;
          };
          return dataSource.every(cb);
        });
      case 'child':
        // 过滤掉parent
        return selected.filter(
          id =>
            !dataSource.find((item: DataType) => item[childrenColumnName] && item[keyName] === id),
        );
      default:
        break;
    }
  }, [childrenColumnName, dataSource, keyName, mode, selected]);

  /** 是否已全部勾选 */
  const checkedAll =
    dataSource.length > 0 &&
    selectedResult!.length > 0 &&
    (mode === 'parent' ? selectedResult! : selected).length === enabledData.length;

  const selectedRows = useMemo(
    () =>
      selectedResult!.map(key =>
        dataSource.find((item: DataType, index) =>
          keyName ? item[keyName] === key : index === key,
        ),
      ) as Array<DataType>,
    [dataSource, keyName, selectedResult],
  );

  const controller: UseTableSelectionController = {
    dataSource,
    isSelectedTotal,
    isSelectedAll: checkedAll,
    selectedRowKeys: selectedResult!,
    selectedRows,
    isChecked(record: DataType): boolean {
      const key = record[keyName];
      const hasChildren = !!record[childrenColumnName];
      if (mode === 'child' && hasChildren) {
        // 汇总行根据children是否全选来判断
        return record[childrenColumnName].every((record: DataType) => {
          if (disabled(record)) {
            return true;
          }
          return selected.includes(record[keyName]);
        });
      }
      return selected.includes(key);
    },
    setSelected,
    selectAll() {
      setSelected(() => {
        const list: string[] = [];
        const add = (record: DataType) => {
          if (!disabled(record)) {
            list.push(record[keyName]);
          }
        };
        const cb = (item: DataType) => {
          add(item);
          item[childrenColumnName]?.forEach(cb);
        };
        dataSource.forEach(cb);
        return list;
      });
    },
    toggle(record: DataType) {
      const key = record[keyName];
      const hasChildren = !!record[childrenColumnName];
      setSelected(selected => {
        let res: Array<string | number> = [];
        const add = (record: DataType) => {
          if (disabled(record)) return;
          res.push(record[keyName]);
        };
        switch (mode) {
          case 'all':
          case 'parent':
            if (selected.includes(key)) {
              const newSelected = selected.slice();
              newSelected.splice(newSelected.indexOf(key), 1);
              res = newSelected;
            } else {
              res = [...selected];
              if (!disabled(record)) add(record);
            }
            break;
          case 'child':
            if (hasChildren) {
              const selectedAllChildren = selected.find(id =>
                record[childrenColumnName].find((item: DataType) => item[keyName] === id),
              );
              const newSelected = selected.slice();
              // eslint-disable-next-line @typescript-eslint/no-unused-expressions
              newSelected.includes(key) && newSelected.splice(newSelected.indexOf(key), 1);
              record[childrenColumnName].forEach((item: DataType) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                newSelected.includes(item[keyName]) &&
                  newSelected.splice(newSelected.indexOf(item[keyName]), 1);
              });
              // children 取消/全选
              if (selectedAllChildren) {
                res = newSelected;
              } else {
                res = newSelected;
                if (!disabled(record)) add(record);
                record[childrenColumnName].forEach((record: DataType) => {
                  if (!disabled(record)) add(record);
                });
              }
            } else {
              const parent: DataType = dataSource.find((item: DataType) =>
                item[childrenColumnName].includes(record),
              )!;
              const newSelected = selected.slice();
              if (newSelected.includes(key)) {
                // 已选取消勾选
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                newSelected.includes(parent[keyName]) &&
                  newSelected.splice(newSelected.indexOf(parent[keyName]), 1);
                newSelected.splice(newSelected.indexOf(key), 1);
                res = newSelected;
              } else {
                // 未勾选则勾选
                res = newSelected;
                add(record);
                const isAllChildrenSelected = parent[childrenColumnName]
                  .filter((record: DataType) => !disabled(record))
                  .every((item: DataType) => res.includes(item[keyName]));
                const isParentSelected = res.includes(parent[keyName]);
                // 已全选则使parent也被选
                if (isAllChildrenSelected && !isParentSelected) {
                  add(parent);
                }
              }
            }
            break;
          default:
            break;
        }
        return res;
      });
    },
    unselectAll() {
      setSelected([]);
    },
    toggleTotal() {
      setIsSelectedTotal(!isSelectedTotal);
    },
    setIsSelectedTotal(value: boolean) {
      setIsSelectedTotal(value);
      if (value) {
        controller.selectAll();
      } else {
        controller.unselectAll();
      }
    },
    reset() {
      setSelected([]);
      setIsSelectedTotal(false);
    },
  };

  const newRowSelection: TableProps<DataType>['rowSelection'] = {
    ...rowSelection,
    // 因为自定义了columnTitle，columnTitle没有传出原checkbox，Table的Checkbox无法继续使用
    fixed: 'left',
    columnWidth: ((rowSelection.columnWidth as number) || 0) + 50,
    columnTitle: (
      <div
        //  className="tw-flex tw-items-center"
        style={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {rowSelection.columnTitle}
        {/* 全选 */}
        <div
          // className="tw-flex tw-items-center tw-pl-3 tw-w-10"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '50px',
          }}
        >
          <Checkbox
            checked={checkedAll}
            onChange={() => (checkedAll ? controller.unselectAll() : controller.selectAll())}
          />
        </div>
      </div>
    ),
    /** RowSelection的所有hook在组合使用时，columnTitle和renderCell遵循“按调用顺序从左到右组合展示” */
    renderCell: (value, record, index, node) => (
      <div
        //  className="tw-flex tw-items-center"
        style={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <>
          {rowSelection.renderCell && rowSelection.renderCell(value, record, index, node)}

          <div
            className={classNames('table-selection ', `mode-${mode}`)}
            // tw-flex tw-items-center tw-pl-3 tw-w-10
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '50px',
            }}
          >
            <Checkbox
              disabled={disabled(record)}
              checked={controller.isChecked(record)}
              onChange={() => {
                const checked = controller.isChecked(record);
                controller.toggle(record);
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                onSelect && onSelect(record, !checked);
              }}
            />
          </div>
        </>
      </div>
    ),
  };

  const newComponents: TableProps<DataType>['components'] = useMemo(
    () =>
      merge(cloneDeep(components), {
        body: {
          row: ({ className, ...options }: any) => (
            <tr
              className={classNames(className, {
                'ant-table-row-selected': selectedResult?.includes(options['data-row-key']),
              })}
              {...options}
            />
          ),
        },
      }),
    [components],
  );

  // 数据变化（翻页）后重置, 且仅监听数据key的变化
  const contactedKeys = dataSource.map(item => item[keyName]).join(',');
  useEffect(() => controller.reset(), [contactedKeys]);

  // 取消勾选后重置全选所有页的状态为false
  useEffect(() => {
    if (!checkedAll) setIsSelectedTotal(false);
  }, [checkedAll]);

  return {
    controller,
    rowSelection: newRowSelection,
    rowKey: keyName as string,
    /** 命名和旧版isSelectedAll保持一致 */
    isSelectedAll: isSelectedTotal,
    selectedRowKeys: selectedResult!,
    selectedRows,
    components: newComponents,
    get BatchActions() {
      const fc = (
        props: Omit<TableBatchActionsProps, 'dataSource' | 'controller' | 'totalCount'>,
      ) => <TableBatchActions controller={controller} totalCount={totalCount} {...props} />;

      const ActionButton: FC<ButtonProps> = ({
        size = 'small',
        type = 'primary',
        ghost = true,
        ...rest
      }) => <Button size={size} type={type} ghost={ghost} {...rest} />;
      fc.Button = ActionButton;

      fc.height = 52;

      return fc;
    },
  };
}

export default useTableSelection;
