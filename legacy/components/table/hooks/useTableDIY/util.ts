import { pickBy, uniq } from 'lodash';
import { isValidElement } from 'react';
import type { ColumnType } from '../../interface';
import type { GroupItem } from './DiyPanel';
import type { ConfigItem } from '.';
import { getColumnKey } from '../util';

export const initGroups = (options: {
  columns: ColumnType<any>[];
  config?: { [columnKey: string]: ConfigItem };
  cacheID: string;
}) => {
  const { columns, config = {}, cacheID } = options;
  const caches: ReturnType<typeof getStorageColumns> =
    JSON.parse(localStorage.getItem(cacheID) || '[]');
  return uniq(columns.map(column => (config[getColumnKey(column) || ''] || {}).group)).map(
    group => ({
      name: group,
      list: columns
        .filter(column => {
          const cfg = config[getColumnKey(column) || ''] || {};
          return cfg.group === group;
        })
        .map(column => {
          const cfg = config[getColumnKey(column) || ''] || {};
          const cache = caches.find(item => item.key === getColumnKey(column) || '')! || {};
          let checked: boolean;
          if ((cache as any).show !== undefined) {
            // 兼容旧版，2023-04月后可以删除
            checked = (cache as any).show;
          } else if (cache.checked !== undefined) {
            checked = cache.checked;
          } else if (cfg.defaultShow !== undefined) {
            checked = cfg.defaultShow;
          } else {
            checked = true;
          }
          return {
            column,
            cfg,
            state: {
              checked,
              sequence: cache.sequence || -1,
            },
          };
        }),
    }),
  );
};

/** 过滤多余数据，避免复杂数据出现 JSON 循环引用报错问题 */
export function getStorageColumns(columns: Array<GroupItem>) {
  return columns.map(({ column, state }, index) => ({
    key: getColumnKey(column),
    ...state,
    sequence: index,
  }));
}

export function getSortedColumns(initialColumns: Array<GroupItem>) {
  const checkedColumns: GroupItem[] = [];
  const uncheckedColumns: GroupItem[] = [];
  const left: GroupItem[] = [];
  const normal: GroupItem[] = [];
  const right: GroupItem[] = [];
  initialColumns.forEach(item => {
    if (item.state.checked) {
      checkedColumns.push(item);
    } else {
      uncheckedColumns.push(item);
    }
    if (item.column.fixed === 'left') {
      left.push(item);
    } else if (item.column.fixed === 'right') {
      right.push(item);
    } else {
      normal.push(item);
    }
  });
  left.sort(
    ({ state: a }, { state: b }) => (a.sequence ?? left.length) - (b.sequence ?? left.length),
  );
  normal.sort(
    ({ state: a }, { state: b }) => (a.sequence ?? normal.length) - (b.sequence ?? normal.length),
  );
  right.sort(
    ({ state: a }, { state: b }) => (a.sequence ?? right.length) - (b.sequence ?? right.length),
  );
  return [...left, ...normal, ...right, ...uncheckedColumns];
}

/** 用于深度比较+排除不支持的对象 */
export function getRawColumns<T>(initialColumns: ColumnType<T>[]) {
  return JSON.stringify(
    initialColumns.map(column =>
      pickBy(column, value => {
        if (typeof value === 'function') return false;
        if (typeof value === 'object' && isValidElement(value)) return false;
        return true;
      }),
    ),
  );
}
