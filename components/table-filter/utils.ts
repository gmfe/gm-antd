// import type { ModelField } from 'gm_api/src/metadata';
// import { FieldValueType } from 'gm_api/src/metadata'
import { pick } from 'lodash'
import type {
  FieldItem,
  CachedFields,
  // MixinFieldItem,
  // FieldInputItem,
  // FieldSelectItem,
  CachedSetting,
} from './types'
// import DataSourceMap from './components/SelectFilter/datasource'

const CACHE_PREFIX = 'table_filter_'

/** 缓存字段配置 */
export function stashFieldItems(
  id: string,
  fields: FieldItem[],
  setting: CachedSetting,
) {
  // 只缓存必要数据,
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
    }))
  localStorage.setItem(CACHE_PREFIX + id, JSON.stringify(data.filter(Boolean)))
}

/** 恢复字段配置缓存 */
export function restoreFieldItems(id: string) {
  const fields: CachedFields = JSON.parse(localStorage.getItem(CACHE_PREFIX + id) || '[]')
  fields.forEach((item) => {
    delete item.visible
  })
  return fields
}

/** 恢复字段配置缓存，设置界面用 */
export function restoreFieldItemsForSetting(id: string, defaultFields: FieldItem[]) {
  const fields: CachedFields = localStorage.getItem(CACHE_PREFIX + id) ? JSON.parse(localStorage.getItem(CACHE_PREFIX + id) || '[]') : defaultFields
  const setting: CachedSetting = fields?.reduce((pre, item) => ({
      ...pre,
      [item.key]: {
        visible: item.visible,
      },
    }), {})
  return setting
}

/** mix元字段配置 */
// export function mixModelField<T extends MixinFieldItem>(
//   modelField: any,
//   mixins: T[],
// ) {
//   const mixinTarget =
//     mixins.find((item) => item.alias.includes(modelField.field_name!))! || {}
//   // 混入参数
//   const mixed = {
//     ...mixinTarget,
//     attributes: modelField,
//     get key() {
//       return this.attributes?.model_field_id
//     },
//     get label() {
//       return mixinTarget.label || this.attributes?.field_desc
//     },
//   } as FieldItem

//   // 根据元属性声明的值类型
//   switch (modelField.field_value_type) {
//     case FieldValueType.FIELDVALUETYPE_NUMBER: {
//       break
//     }
//     case FieldValueType.FIELDVALUETYPE_STRING: {
//       const override: Partial<FieldInputItem> = { type: 'input' }
//       Object.assign(mixed, override)
//       break
//     }
//     case FieldValueType.FIELDVALUETYPE_BOOL: {
//       break
//     }
//     case FieldValueType.FIELDVALUETYPE_ENUM: {
//       const override: Partial<FieldSelectItem> = {
//         type: 'select',
//         get options() {
//           return Object.entries(
//             mixed.attributes?.field_enum?.elements || {},
//           ).map(([key, value]) => ({
//               text: value,
//               value: key,
//             }))
//         },
//       }
//       Object.assign(mixed, override)
//       break
//     }
//     default:
//       break
//   }

//   if (mixed.type === 'select' && modelField.join_model_type) {
//     mixed.options = DataSourceMap[modelField.join_model_type]
//   }
//   return mixed
// }
