// import type { QueryCriteriaGroup } from 'gm_api/src/common'
// import { ListModelField } from 'gm_api/src/metadata'
import { debounce, get, keyBy, merge, orderBy, pickBy, set } from 'lodash';
import { makeAutoObservable, toJS } from 'mobx';
import type { Moment } from 'moment';
import type {
  FieldItem,
  // MixinFieldItem,
  TableFilterProps,
  UsePaginationResult,
  // TableListSourceMapType,
} from './types';
import {
  // mixModelField,
  restoreFieldItems,
  restoreFieldItemsForSetting,
} from './utils';

type Options = {
  id: string;
  // model_type?: keyof TableListSourceMapType
  fixedFields?: Array<FieldItem>;
  // mixins?: Array<MixinFieldItem>;
  paginationResult?: UsePaginationResult;
  trigger?: TableFilterProps['trigger'];
  /** 是否在select Options 异步获取时保存他的option 值 */
  isSaveOptions?: boolean;
  onSearch?: TableFilterProps['onSearch'];
};

type OptionDataType = {
  label?: string | React.ReactNode;
  text?: string;
  value: string | number;
  children?: OptionDataType[];
  [key: string]: any;
};

class TableFilterStore {
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true });
  }

  id!: string;

  // private _model_type?: keyof TableListSourceMapType

  /** 云字段的mixin */
  // private _mixins?: MixinFieldItem[];

  /** 固定字段 */
  private _fixedFields?: FieldItem[];

  private _paginationResult?: UsePaginationResult;

  focusedFieldKey = '';

  trigger?: TableFilterProps['trigger'];

  /** 所有字段列表 */
  fields: FieldItem[] = [];

  loading = false;

  /** 异步获取的options */
  optionData: Record<string, OptionDataType[]> = {};

  /** 是否在select Options 异步获取时保存他的option 值 */
  isSaveOptions?: boolean = false;

  /** 可见(启用)的字段列表 */
  getVisibleFields() {
    const cachedSetting = restoreFieldItemsForSetting(this.id, this.fields);
    const visibleFields = this.fields.filter(item => {
      const used = cachedSetting[item.key]?.visible;
      return item.alwaysUsed || (used ?? item.defaultUsed);
    });
    return visibleFields;
  }

  async init({
    id,
    // model_type,
    fixedFields = [],
    // mixins = [],
    paginationResult,
    trigger,
    isSaveOptions,
  }: Options) {
    this.id = id;
    // this._model_type = model_type
    // this._mixins = mixins;
    this._fixedFields = fixedFields;
    this._paginationResult = paginationResult;
    this.trigger = trigger;
    this.isSaveOptions = isSaveOptions ?? false;
    // 使用缓存，避免跳动
    this.fields = orderBy(
      fixedFields
        .map(field => this._applyDefaultFieldValue(field))
        .map(field => this._applyCachedValueToDefault(field))
        .filter(field => !field.hide),
      ['sort'],
      ['asc'],
    ) as typeof fixedFields;
    // 加载云字段
    // if (!this._model_type) return Promise.resolve()
    // return ListModelField({
    //   model_type: this._model_type,
    //   paging: {
    //     limit: 999,
    //   },
    // }).then(({ response: { model_fields = [] } }) => {
    //   const mixedFields = model_fields.map((field) => {
    //     const mixedItem = mixModelField(field, this._mixins!)
    //     const fieldItem = this._applyDefaultFieldValue(mixedItem)
    //     return this._applyCachedValueToDefault(fieldItem)
    //   })
    //   this.fields = this._fixedFields!.concat(mixedFields)
    // })
  }

  /** 字段默认值 */
  private _applyDefaultFieldValue(field: FieldItem): FieldItem {
    const res = {
      ...field,
      // minWidth: field.minWidth ?? 160,
      // maxWidth: field.maxWidth ?? 320,
      hideLabel: field.hideLabel ?? false,
      defaultUsed: field.defaultUsed ?? false,
      alwaysUsed: field.alwaysUsed ?? false,
      hide: field.hide ?? false,
      allowClear: field.allowClear ?? true,
    };
    return res;
  }

  /** 字段缓存值 */
  private _applyCachedValueToDefault(field: FieldItem) {
    const cachedFields = (restoreFieldItems(this.id) as FieldItem[]).filter(item =>
      this._fixedFields?.find(item2 => item2.key !== item.key),
    );
    const cachedField = cachedFields.find(item => item.key === field.key) || {};
    return merge(field, cachedField);
  }

  /** Key为fields的key，value为表单项的值 */
  attributes: {
    [key: string]:
      | {
          value?: any;
        }
      | undefined;
  } = {};

  /** 包含group字段的下拉框索引 */
  groups = new Map<string, number>();

  /** 获取字段 */
  get field() {
    return (key: string) =>
      this.fields.find(field => field.key === key || field.attributes?.model_field_id === key);
  }

  /** 获取指定field的表单项值, key可以为字符串(`field.key`)或`FieldItem`，传`FieldItem`获得更好类型支持 */
  get<T extends FieldItem | string>(
    _key: T,
  ): T extends string ? any : T extends FieldItem ? T['defaultValue'] : any {
    const key = typeof _key === 'object' ? _key.key : (_key as string);
    if (!Object.keys(this.attributes).includes(key)) {
      return this.field(key)?.defaultValue as any;
    }
    return get(this.attributes, [key, 'value']);
  }

  /** 设置指定Field的表单项值 */
  set<T extends FieldItem | string>(
    key: T,
    value: T extends string ? any : T extends FieldItem ? T['defaultValue'] : any,
  ) {
    if (typeof key === 'object') {
      set(this.attributes, [key.key, 'value'], value);
    } else {
      set(this.attributes, [key, 'value'], value);
    }
  }

  /** 取合并后的表单键值对象 */
  toParams() {
    const fields = this.getVisibleFields();
    const params = {
      ...fields.reduce((pre, field) => {
        const target = this.get(field.key);
        if (target === undefined) return pre;

        // group 中的字段只提交active的
        const groups = field.group ? fields.filter(item => item.group === field.group) : [field];
        const indexInGroup = groups.indexOf(field);
        const activeIndexInGroup = this.groups.get(field.group || '') || 0;
        if (field.group && indexInGroup !== activeIndexInGroup) return pre;

        // 使用自定义方法merge
        if (field.toParam) {
          return merge(pre, field.toParam(target ? toJS(target) : target, pre));
        }

        let value;
        switch (field?.type) {
          case 'input': {
            const _value = this.get(field);
            if (!_value) break;
            value = _value;
            break;
          }
          case 'select': {
            const _value = this.get(field);
            if (_value === undefined) break;
            if (!field.multiple) {
              value = _value;
            } else {
              value = _value;
            }
            break;
          }
          case 'date': {
            const _value = this.get(field);
            if (!_value) break;
            if (field.range) {
              value = (_value as Moment[]).map(m => +m.toDate());
            } else {
              value = +(_value as Moment).toDate();
            }
            break;
          }
          case 'cascader': {
            const _value = this.get(field);
            if (!_value) break;
            value = _value;
            break;
          }
          default:
            break;
        }

        if (!value) return pre;

        return merge(pre, { [field.key]: value });
      }, {}),
    };
    return pickBy(params, Boolean);
  }

  /** TODO: 云字段 */
  // toQuery() {
  //   return {
  //     query: {
  //       query_criteria_groups: Object.keys(this.attributes).reduce(
  //         (pre, key, i) => {
  //           const item = this.attributes[key]
  //           // TODO: 转换为接口值
  //           pre.push({
  //             // field_name: key,
  //             // compare_type: CompareType.COMPARETYPE_EQ,
  //             // compare_value: item.value,
  //           })
  //           return pre
  //         },
  //         [] as QueryCriteriaGroup[],
  //       ),
  //     } as QueryCriteriaGroup,
  //   }
  // }

  /** 搜索 */
  search = debounce(
    () => {
      const params = this.toParams();
      this.loading = true;
      if (this._paginationResult) {
        return this._paginationResult!.run(params).finally(() => {
          this.loading = false;
        });
      }
    },
    500,
    { leading: true, trailing: false },
  );

  /** 清空所有表单字段输入 */
  reset(skipFields: string[] = []) {
    Object.keys(this.attributes).forEach(key => {
      // 跳过指定字段
      if (skipFields.includes(key)) return;
      delete this.attributes[key];
    }, {});
    this.groups.clear();
  }

  /** 重置实例 */
  clear() {
    this.loading = false;
    this.fields = [];
    this.attributes = {};
    this.groups = new Map();
    // this._mixins = [];
    this._fixedFields = [];
    this._paginationResult = undefined;
  }

  updateFields(fields: FieldItem[] = []) {
    const currentFields = this.fields;
    const keyByFieldKey = keyBy(fields, 'key');
    const keyByCurrentFieldKey = keyBy(currentFields, 'key');
    const newAddFields = fields.filter((field) => !keyByCurrentFieldKey[field.key])

    // const differentField = differenceBy(fields, this.fields)
    const newFields = currentFields.map(field => {
      return {
        ...field,
        ...keyByFieldKey[field.key],
        sort: (field as any).sort,
      }
    })

    this.fields = [...newFields, ...newAddFields] as FieldItem[];
  }

  searchNow = () => {
    console.log("searchNow")
    const params = this.toParams();
    this.loading = true;
    if (this._paginationResult) {
      return this._paginationResult!.run(params).finally(() => {
        this.loading = false;
      });
    }
  };

  setOptionData(keyName: string, data: OptionDataType[]) {
    this.optionData[keyName] = data;
  }

  setLoading(flag: boolean) {
    this.loading = flag;
  }
}

export default TableFilterStore;
