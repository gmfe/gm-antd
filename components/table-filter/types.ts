import type { Moment } from 'moment';
import type { HTMLAttributes } from 'react';
import type { RangeValue, PickerMode } from 'rc-picker/lib/interface';
// import type { ModelField } from 'gm_api/src/metadata'
// import TableListSourceMap from './sources'
import type { UsePaginationResult as GMUsePaginationResult } from '@gm-common/hooks';
import type { RangePickerProps } from '../date-picker';
import type { PickerDateProps, RangePickerDateProps } from '../date-picker/generatePicker';

// export type TableListSourceMapType = typeof TableListSourceMap
// export type UsePaginationResult = {
//   [key: string]: any;
//   run: (params?: P) => Promise<D>;
// };
export type UsePaginationResult = Partial<GMUsePaginationResult> &
  Pick<GMUsePaginationResult, 'run'>;

export interface TableFilterProps
  extends Pick<HTMLAttributes<HTMLDivElement>, 'className' | 'style'> {
  /** 配合usePagination使用 */
  paginationResult: UsePaginationResult;
  /** 全局唯一id, 缓存标识，默认使用路由路径作为id因此同路由下使用1个以上这个组件需要指定唯一id */
  id?: string;
  /** 前端编码的字段 */
  fields?: Array<FieldItem>;
  /** 如果指定了model_type，则会通过ListModelField把对应模型的所有云字段也加载进来 */
  // model_type?: keyof TableListSourceMapType;
  /** 当某些场景下某些云字段不完善，可以使用mixin对其进行补充，用alias进行匹配 */
  // mixins?: Array<MixinFieldItem>;
  /** 就绪时立即run一次搜索 */
  immediate?: boolean;
  /**
   * 触发搜索的方式，默认为`manual`；
   *
   * - `manual` 点击“查询”按钮后才查询；
   * - `onChange` 字段表单变化后查询，且查询和重置按钮会被隐藏；
   * - `both` 字段表单变化后查询，点击“查询”按钮后查询；
   */
  trigger?: 'onChange' | 'manual' | 'both';
  /** 自定义模式 */
  customMode?: ''
  /** 是否显示展开收起按钮 */
  isExpanded?: boolean
  /** 是否更新 fields */
  isUpdateFields?: boolean
  /** 是否一直显示自定义按钮 */
  isAlwaysShowCustom?: boolean
  /** 在重置的时候跳过某些值的初始化 */
  skipInitialValues?: string[]
  /** 设置保存回调 */
  onCustomSave?: () => void
}

/** 表单项 */
export interface FieldBaseItem {
  /** 元属性 */
  readonly attributes?: Readonly<any>;
  key: string;
  /** 字段标签 */
  label?: string;
  /** 表单中不展示label */
  hideLabel?: boolean;
  /** @deprecated 已移除，采用栅格方案 表单项最小宽度, 默认160 */
  minWidth?: number | string;
  /** @deprecated 已移除，采用栅格方案 表单项最大宽度, 默认320 */
  maxWidth?: number | string;
  /** Group相同的表单项在交互上合并成一个，比如 按下单日期/按收货日期 */
  group?: string;
  /** 默认为false，为true在“全部筛选条件”中初始时为勾选状态 */
  defaultUsed?: boolean;
  /** 默认为false，为true不允许在“全部筛选条件”中取消勾选 */
  alwaysUsed?: boolean;
  /** 是否隐藏 */
  hide?: boolean;
  placeholder?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否折叠 */
  collapsed?: boolean
  /** 自定义组件 */
  render?: React.ReactNode;
}

type API_Method = (r?: any, codes?: number[]) => Promise<any>;
type ToParam<Option, API extends API_Method> = (
  value: Option,
  pre: Partial<Exclude<Parameters<API>[0], undefined>>,
) => Partial<Exclude<Parameters<API>[0], undefined>>;

/** 表单项-输入框 */
export interface FieldInputItem<API extends API_Method = API_Method> extends FieldBaseItem {
  type: 'input';
  /** Antd， 输入框类型 */
  inputType?: 'number' | 'text';
  /** 默认值 */
  defaultValue?: string;
  /**
   * 自定义如何merge本字段的键值到params中，默认merge { [FieldItem.key]: value }到params中
   *
   * 如果value为undefined（字段没有输入），不会进入此函数，而是直接忽略此字段
   */
  toParam?: ToParam<FieldInputItem<API>['defaultValue'], API>;
}

/** 表单项-数字输入框 */
// export interface FieldInputNumberItem<API extends API_Method = API_Method>
//   extends FieldBaseItem {
//   type: 'inputNumber'
//   /** 默认值 */
//   defaultValue?: string
//   /** antd， 最小值 */
//   min?: number
//   /** antd， 最大值 */
//   max?: number
//   /** 自定义如何merge本字段的键值到params中，默认merge { [FieldItem.key]: value }到params中
//    *
//    * 如果value为undefined（字段没有输入），不会进入此函数，而是直接忽略此字段
//    */
//   toParam?: ToParam<FieldInputItem<API>['defaultValue'], API>
// }

/** 表单项-选择框 */
export type SelectOptions = Array<{
  text: string;
  value: number | string;
  /** 分组名，相同展示为一组 */
  group?: string;
}>;

export interface FieldSelectItem<
  API extends API_Method = API_Method,
  Multiple extends boolean = boolean,
  S extends SelectOptions = SelectOptions,
> extends FieldBaseItem {
  type: 'select';
  multiple?: Multiple;
  /**
   * 列表选项，支持数组、函数、异步函数
   *
   * 支持远程搜索
   *
   * Gm_api的List接口支持直接用helper.ts中的{@link generateListOptions}方法转换
   */
  options?: S | ((searchVal?: string) => S) | ((searchVal?: string) => Promise<S>);
  /** 默认值，不传为空，为空提交时忽略此字段 */
  defaultValue?: Multiple extends true ? S[0]['value'][] : S[0]['value'];
  /** 远程搜索模式，默认为false即前端筛选模式 */
  remote?: boolean;
  /** 同 {@link FieldInputItem.toParam} */
  toParam?: ToParam<Multiple extends true ? S[0]['value'][] : S[0]['value'], API>;
}

/** 表单项-日期选择器 */
export interface FieldDateTypeItem<API extends API_Method = API_Method> extends FieldBaseItem {
  type: 'date';
  /** 区间型选择器 */
  range?: false;
  defaultValue?: Moment;
  /** 同 {@link FieldDateRangeItem.showTime} */
  showTime?: PickerDateProps<Moment>['showTime'];
  /** 同 {@link FieldDateRangeItem.disabledDate} */
  disabledDate?: PickerDateProps<Moment>['disabledDate'];
  /** Antd, 设置选择器类型 */
  picker?: PickerMode;
  /** 同 {@link FieldInputItem.toParam} */
  toParam?: ToParam<Moment, API>;
}

/** 表单类型，日期范围选择器 */
export interface FieldDateRangeItem<API extends API_Method = API_Method> extends FieldBaseItem {
  type: 'date';
  /** 区间型选择器 */
  range: true;
  defaultValue?: RangeValue<Moment>;
  /** Antd,预设时间范围快捷选择 */
  ranges?: RangePickerProps['ranges'];
  /** Antd,增加时间选择功能 */
  showTime?: RangePickerDateProps<Moment>['showTime'];
  /** Antd,不可选择的日期 */
  disabledDate?: RangePickerProps['disabledDate'];
  /** Antd, 设置选择器类型 */
  picker?: PickerMode;
  /** 同 {@link FieldInputItem.toParam]} */
  toParam?: ToParam<RangeValue<Moment>, API>;
}

export type FieldDateItem = FieldDateTypeItem | FieldDateRangeItem;

export interface CasCaderOption {
  value: string | number;
  label?: React.ReactNode;
  disabled?: boolean;
  children?: CasCaderOption[];
}

/** 表单项-级联选择器 */
export interface FieldCascaderItem<
  API extends API_Method = API_Method,
  Multiple extends boolean = boolean,
> extends FieldBaseItem {
  type: 'cascader';
  /** Antd, 多选 */
  multiple: Multiple;
  options?: CasCaderOption[] | (() => CasCaderOption[]) | (() => Promise<CasCaderOption[]>);
  defaultValue?: string[];
  /** Antd, 根结点是否可选，默认为true */
  changeOnSelect?: boolean;
  /** 同 {@link FieldInputItem.toParam} */
  toParam?: ToParam<Multiple extends true ? string[][] : string[], API>;
}

/**
 * 字段配置，使用到toParams时建议传入api,类型更安全：
 *
 *     const FIELDS: FieldItem<typeof ListSaleOutStockSheet>[] = [{...}]
 */
export type FieldItem<API extends API_Method = API_Method> =
  | FieldInputItem<API>
  // | FieldInputNumberItem<API>
  | FieldSelectItem<API>
  | FieldSelectItem<API>
  | FieldDateTypeItem<API>
  | FieldDateRangeItem<API>
  | FieldCascaderItem<API>;

// MixinFieldItem不需要的属性
type IgnoredMixinFields = 'attributes' | 'key';
type Mixin = {
  /** 要补充的field，值为ModelField的field_name，如果alias中有一个匹配到ModelField.field_name，就会混入ModelField */
  alias: string[];
};
export type MixinFieldItem =
  | (Omit<FieldInputItem, IgnoredMixinFields> & Mixin)
  | (Omit<FieldSelectItem, IgnoredMixinFields> & Mixin)
  | (Omit<FieldDateTypeItem, IgnoredMixinFields> & Mixin)
  | (Omit<FieldDateRangeItem, IgnoredMixinFields> & Mixin)
  | (Omit<FieldDateItem, IgnoredMixinFields> & Mixin)
  | (Omit<FieldCascaderItem, IgnoredMixinFields> & Mixin);

export interface CachedSetting {
  [key: string]: { visible?: boolean };
}

export type CachedFields = Array<
  {
    attributes?: any;
    visible?: boolean;
  } & Pick<FieldItem, 'key' | 'label' | 'type'>
>;
