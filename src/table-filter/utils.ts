import { pick } from 'lodash';
import type { FieldItem, CachedFields, CachedSetting } from './types';

const CACHE_PREFIX = 'table_filter_';

export function stashFieldItems(
  id: string,
  fields: FieldItem[],
  setting: CachedSetting,
) {
  const data: CachedFields = fields.map((item, index) => ({
    attributes:
      item.attributes &&
      pick(item.attributes, [
        'model_field_id',
        'field_desc',
        'field_value_type',
      ]),
    ...pick(item, ['key', 'label', 'type']),
    visible: setting[item.key]?.visible,
    sort: index,
  }));
  localStorage.setItem(CACHE_PREFIX + id, JSON.stringify(data.filter(Boolean)));
}

export function restoreFieldItems(id: string) {
  const fields: CachedFields = JSON.parse(localStorage.getItem(CACHE_PREFIX + id) || '[]');
  fields.forEach((item) => {
    delete item.visible;
  });
  return fields;
}

export function restoreFieldItemsForSetting(id: string, defaultFields: FieldItem[]) {
  const fields: CachedFields = localStorage.getItem(CACHE_PREFIX + id)
    ? JSON.parse(localStorage.getItem(CACHE_PREFIX + id) || '[]')
    : defaultFields;
  const setting: CachedSetting = fields?.reduce(
    (pre, item) => ({
      ...pre,
      [item.key]: {
        visible: item.visible,
      },
    }),
    {},
  );
  return setting;
}
