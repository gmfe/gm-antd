import { debounce, get, keyBy, merge, orderBy, pickBy, set } from 'lodash';
import { makeAutoObservable, runInAction, toJS } from 'mobx';
import type { Dayjs } from 'dayjs';
import type { FieldItem, TableFilterProps, UsePaginationResult } from './types';
import { restoreFieldItems, restoreFieldItemsForSetting } from './utils';

type Options = {
  id: string;
  fixedFields?: Array<FieldItem>;
  paginationResult?: UsePaginationResult;
  trigger?: TableFilterProps['trigger'];
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
  private _fixedFields?: FieldItem[];
  private _paginationResult?: UsePaginationResult;
  focusedFieldKey = '';
  trigger?: TableFilterProps['trigger'];
  fields: FieldItem[] = [];
  loading = false;
  optionData: Record<string, OptionDataType[]> = {};
  isSaveOptions?: boolean = false;
  onSearch?: TableFilterProps['onSearch'];

  setSearch(func: TableFilterProps['onSearch']) {
    this.onSearch = func;
  }

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
    fixedFields = [],
    paginationResult,
    trigger,
    isSaveOptions,
  }: Options) {
    this.id = id;
    this._fixedFields = fixedFields;
    this._paginationResult = paginationResult;
    this.trigger = trigger;
    this.isSaveOptions = isSaveOptions ?? false;
    this.fields = orderBy(
      fixedFields
        .map(field => this._applyDefaultFieldValue(field))
        .map(field => this._applyCachedValueToDefault(field))
        .filter(field => !field.hide),
      ['sort'],
      ['asc'],
    ) as typeof fixedFields;
  }

  private _applyDefaultFieldValue(field: FieldItem): FieldItem {
    return {
      ...field,
      hideLabel: field.hideLabel ?? false,
      defaultUsed: field.defaultUsed ?? false,
      alwaysUsed: field.alwaysUsed ?? false,
      hide: field.hide ?? false,
      allowClear: field.allowClear ?? true,
    };
  }

  private _applyCachedValueToDefault(field: FieldItem) {
    const cachedFields = (restoreFieldItems(this.id) as FieldItem[]).filter(item =>
      this._fixedFields?.some(item2 => item2.key === item.key),
    );
    const cachedField = cachedFields.find(item => item.key === field.key) || {};
    return merge(field, cachedField);
  }

  attributes: {
    [key: string]:
      | {
          value?: any;
        }
      | undefined;
  } = {};

  groups = new Map<string, number>();

  get field() {
    return (key: string) =>
      this.fields.find(field => field.key === key || field.attributes?.model_field_id === key);
  }

  get<T extends FieldItem | string>(
    _key: T,
  ): T extends string ? any : T extends FieldItem ? T['defaultValue'] : any {
    const key = typeof _key === 'object' ? _key.key : (_key as string);
    if (!Object.keys(this.attributes).includes(key)) {
      return this.field(key)?.defaultValue as any;
    }
    return get(this.attributes, [key, 'value']);
  }

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

  toParams() {
    const fields = this.getVisibleFields();
    const params = {
      ...fields.reduce((pre, field) => {
        const target = this.get(field.key);
        if (target === undefined) return pre;

        const groups = field.group ? fields.filter(item => item.group === field.group) : [field];
        const indexInGroup = groups.indexOf(field);
        const activeIndexInGroup = this.groups.get(field.group || '') || 0;
        if (field.group && indexInGroup !== activeIndexInGroup) return pre;

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
            value = _value;
            break;
          }
          case 'date': {
            const _value = this.get(field);
            if (!_value) break;
            if (field.range) {
              value = (_value as Dayjs[]).map(m => +m.toDate());
            } else {
              value = +(_value as Dayjs).toDate();
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

        if (value === undefined || value === null) return pre;

        return merge(pre, { [field.key]: value });
      }, {}),
    };
    return pickBy(params, v => v !== undefined && v !== null);
  }

  search = debounce(
    () => {
      const params = this.toParams();
      if (this.onSearch) {
        this.loading = true;
        Promise.resolve(this.onSearch(params)).finally(() => {
          runInAction(() => {
            setTimeout(() => {
              this.loading = false;
            }, 50);
          });
        });
      }
      if (this._paginationResult) {
        this.loading = true;
        return this._paginationResult!.run(params).finally(() => {
          this.loading = false;
        });
      }
    },
    500,
    { leading: true, trailing: false },
  );

  reset(skipFields: string[] = []) {
    Object.keys(this.attributes).forEach(key => {
      if (skipFields.includes(key)) return;
      delete this.attributes[key];
    }, {});
    this.groups.clear();
  }

  clear() {
    this.loading = false;
    this.fields = [];
    this.attributes = {};
    this.groups = new Map();
    this._fixedFields = [];
    this._paginationResult = undefined;
  }

  updateFields(fields: FieldItem[] = []) {
    const currentFields = this.fields;
    const keyByFieldKey = keyBy(fields, 'key');
    const keyByCurrentFieldKey = keyBy(currentFields, 'key');
    const newAddFields = fields.filter(field => !keyByCurrentFieldKey[field.key]);

    const newFields = currentFields.map(field => ({
      ...field,
      ...keyByFieldKey[field.key],
      sort: (field as any).sort,
    }));

    this.fields = [...newFields, ...newAddFields] as FieldItem[];
  }

  searchNow = () => {
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
