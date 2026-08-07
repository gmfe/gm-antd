import type { FC } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { ButtonProps, TableProps } from 'antd';
import { cloneDeep, merge } from 'lodash';
import classNames from 'classnames';
import { Checkbox, theme } from 'antd';
import type { TableBatchActionsProps } from './BatchActions';
import TableBatchActions from './BatchActions';
// 批量操作按钮此前渲染为原生 <button> + data-type/data-ghost 属性, 依赖配套 CSS 呈现样式,
// 但 antd5 迁移后该 CSS 缺失, 导致批量按钮退化为浏览器默认按钮外观。
// 改为直接使用 gm Button, 复用统一的按钮样式体系。
import Button from '../../../button';

export interface UseTableSelectionOptions<
  DataType extends { [key: string]: any } = any,
  ChildrenColumnName extends string = 'children',
> {
  dataSource: TableProps<DataType>['dataSource'];
  rowSelection: TableProps<DataType>['rowSelection'];
  components?: TableProps<DataType>['components'];
  keyName: string | number;
  totalCount?: number;
  mode?: 'all' | 'parent' | 'child';
  childrenColumnName?: ChildrenColumnName;
  disabled?: <IsParent extends boolean = false>(
    record: IsParent extends true ? DataType : DataType[ChildrenColumnName][0],
    isParent?: IsParent,
  ) => boolean;
  onSelect?: (record: DataType, selected: boolean) => void;
}

export interface UseTableSelectionResult<DataType> {
  rowSelection: TableProps<DataType>['rowSelection'];
  rowKey?: string;
  components: TableProps<DataType>['components'];
  selectedRowKeys: Array<string | number>;
  selectedRows: DataType[];
  isSelectedAll: boolean;
  controller: UseTableSelectionController;
  BatchActions: FC<Omit<TableBatchActionsProps, 'dataSource' | 'controller' | 'totalCount'>> & {
    Button: FC<ButtonProps>;
    height: number;
  };
}

export interface UseTableSelectionController<DataType = any> {
  dataSource: TableProps<DataType>['dataSource'];
  isSelectedTotal: boolean;
  isSelectedAll: boolean;
  selectedRowKeys: (string | number)[];
  selectedRows: TableProps<DataType>['dataSource'];
  isChecked(record: DataType): boolean;
  selectAll(): void;
  unselectAll(): void;
  toggle(record: DataType): void;
  toggleTotal(): void;
  reset(): void;
  setSelected: React.Dispatch<React.SetStateAction<(string | number)[]>>;
  setIsSelectedTotal(value: boolean): void;
}

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
  const [isSelectedTotal, setIsSelectedTotal] = useState(false);

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
        return selected.filter(
          id =>
            !dataSource.find((item: DataType) => item[childrenColumnName] && item[keyName] === id),
        );
      default:
        break;
    }
  }, [childrenColumnName, dataSource, keyName, mode, selected]);

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
        // 与 legacy 对齐：禁用的行不可选中；此前误写为 !disabled 导致正常行永远加不进去
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
              newSelected.includes(key) && newSelected.splice(newSelected.indexOf(key), 1);
              record[childrenColumnName].forEach((item: DataType) => {
                newSelected.includes(item[keyName]) &&
                  newSelected.splice(newSelected.indexOf(item[keyName]), 1);
              });
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
                item[childrenColumnName].find((item: DataType) => item[keyName] === key),
              )!;
              const newSelected = selected.slice();
              if (newSelected.includes(key)) {
                newSelected.includes(parent[keyName]) &&
                  newSelected.splice(newSelected.indexOf(parent[keyName]), 1);
                newSelected.splice(newSelected.indexOf(key), 1);
                res = newSelected;
              } else {
                res = newSelected;
                add(record);
                const isAllChildrenSelected = parent[childrenColumnName]
                  .filter((record: DataType) => !disabled(record))
                  .every((item: DataType) => res.includes(item[keyName]));
                const isParentSelected = res.includes(parent[keyName]);
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
    fixed: 'left',
    columnWidth: ((rowSelection.columnWidth as number) || 0) + 50,
    columnTitle: (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <>
          {rowSelection.columnTitle}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 50 }}>
            <Checkbox
              checked={checkedAll}
              onChange={() => (checkedAll ? controller.unselectAll() : controller.selectAll())}
            />
          </div>
        </>
      </div>
    ),
    renderCell: (value, record, index, node) => (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <>
          {rowSelection.renderCell && rowSelection.renderCell(value, record, index, node)}
          <div
            className={classNames('table-selection ', `mode-${mode}`)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 50 }}
          >
            <Checkbox
              disabled={disabled(record)}
              checked={controller.isChecked(record)}
              onChange={() => {
                const checked = controller.isChecked(record);
                controller.toggle(record);
                onSelect && onSelect(record, !checked);
              }}
            />
          </div>
        </>
      </div>
    ),
  };

  // Use ref to fix stale closure bug — body.row reads current selection from ref
  const selectedRef = useRef(selectedResult);
  selectedRef.current = selectedResult!;

  // tsup dts worker (rollup-plugin-dts) 会把 antd theme 命名空间错误推断为 null
  // (TS2531, 标准 tsc 不报)。运行时 useToken 恒返回对象, 显式标注 theme 结构绕过。
  const { token } = (
    theme as unknown as {
      useToken: () => { token: { colorPrimaryBg: string } };
    }
  ).useToken();

  const newComponents: TableProps<DataType>['components'] = useMemo(
    () =>
      merge(cloneDeep(components), {
        body: {
          row: ({ className, style, ...options }: any) => {
            const isSelected = selectedRef.current?.includes(options['data-row-key']);
            return (
              <tr
                className={classNames(className, { 'gm-row-selected': isSelected })}
                style={isSelected ? { ...style, backgroundColor: token.colorPrimaryBg } : style}
                {...options}
              />
            );
          },
        },
      }),
    [components, token.colorPrimaryBg],
  );

  const contactedKeys = dataSource.map(item => item[keyName]).join(',');
  useEffect(() => controller.reset(), [contactedKeys]);

  useEffect(() => {
    if (!checkedAll) setIsSelectedTotal(false);
  }, [checkedAll]);

  return {
    controller,
    rowSelection: newRowSelection,
    rowKey: keyName as string,
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
      }) => (
        <Button size={size} type={type} ghost={ghost} {...(rest as any)} />
      );
      fc.Button = ActionButton;

      fc.height = 52;

      return fc;
    },
  };
}

export default useTableSelection;
