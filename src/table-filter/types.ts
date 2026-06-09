import type { Dayjs } from 'dayjs';
import type { HTMLAttributes } from 'react';
import type { CascaderProps, SelectProps } from 'antd';
import type { UsePaginationResult as GMUsePaginationResult } from '@gm-common/hooks';

export type UsePaginationResult = Partial<GMUsePaginationResult> &
  Pick<GMUsePaginationResult, 'run'>;

export interface TableFilterProps
  extends Pick<HTMLAttributes<HTMLDivElement>, 'className' | 'style'> {
  paginationResult?: UsePaginationResult;
  id?: string;
  fields?: Array<FieldItem>;
  immediate?: boolean;
  trigger?: 'onChange' | 'manual' | 'both';
  isExpanded?: boolean;
  isUpdateFields?: boolean;
  isAlwaysShowCustom?: boolean;
  skipInitialValues?: string[];
  isSaveOptions?: boolean;
  onCustomSave?: () => void;
  onSearch?: (params: any) => void;
  resetFn?: (params?: any) => void;
}

export interface FieldBaseItem {
  readonly attributes?: Readonly<any>;
  key: string;
  label?: string;
  hideLabel?: boolean;
  minWidth?: number | string;
  maxWidth?: number | string;
  group?: string;
  defaultUsed?: boolean;
  alwaysUsed?: boolean;
  hide?: boolean;
  placeholder?: string;
  disabled?: boolean;
  allowClear?: boolean;
  collapsed?: boolean;
  sort?: number;
  render?: React.ReactNode;
}

type API_Method = (r?: any, codes?: number[]) => Promise<any>;
type ToParam<Option, API extends API_Method> = (
  value: Option,
  pre: Partial<Exclude<Parameters<API>[0], undefined>>,
) => Partial<Exclude<Parameters<API>[0], undefined>>;

export interface FieldInputItem<API extends API_Method = API_Method> extends FieldBaseItem {
  type: 'input';
  inputType?: 'number' | 'text';
  defaultValue?: string;
  toParam?: ToParam<FieldInputItem<API>['defaultValue'], API>;
}

export type SelectOptions = Array<{
  text: string;
  value: number | string;
  group?: string;
}>;

export interface FieldSelectItem<
  API extends API_Method = API_Method,
  Multiple extends boolean = boolean,
  S extends SelectOptions = SelectOptions,
> extends FieldBaseItem {
  type: 'select';
  multiple?: Multiple;
  allowClear?: boolean;
  trigger?: 'onChange' | 'manual' | 'both' | 'onBlur';
  options?: S | ((searchVal?: string) => S) | ((searchVal?: string) => Promise<S>);
  defaultValue?: Multiple extends true ? S[0]['value'][] : S[0]['value'];
  remote?: boolean;
  maxLength?: number;
  selectProps?: SelectProps;
  toParam?: ToParam<Multiple extends true ? S[0]['value'][] : S[0]['value'], API>;
  isMountToFetch?: boolean;
}

export interface FieldDateTypeItem<API extends API_Method = API_Method> extends FieldBaseItem {
  type: 'date';
  range?: false;
  defaultValue?: Dayjs;
  showTime?: any;
  disabledDate?: any;
  picker?: any;
  toParam?: ToParam<Dayjs, API>;
  allowClear?: boolean;
}

export interface FieldDateRangeItem<API extends API_Method = API_Method> extends FieldBaseItem {
  type: 'date';
  range: true;
  defaultValue?: [Dayjs | null, Dayjs | null] | null;
  ranges?: Record<string, [Dayjs, Dayjs]>;
  showTime?: any;
  disabledDate?: any;
  picker?: any;
  openClearValues?: boolean;
  toParam?: ToParam<[Dayjs | null, Dayjs | null] | null, API>;
  onCalendarChange?: (val: any, dateStrings: string[], info: any) => void;
  allowClear?: boolean;
}

export type FieldDateItem = FieldDateTypeItem | FieldDateRangeItem;

export interface CasCaderOption {
  value: string | number;
  label?: React.ReactNode;
  disabled?: boolean;
  children?: CasCaderOption[];
}

export interface FieldCascaderItem<
  API extends API_Method = API_Method,
  Multiple extends boolean = boolean,
> extends FieldBaseItem {
  type: 'cascader';
  multiple?: Multiple;
  showSearch?: boolean;
  options?: CasCaderOption[] | (() => CasCaderOption[]) | (() => Promise<CasCaderOption[]>);
  defaultValue?: string[];
  changeOnSelect?: boolean;
  toParam?: ToParam<Multiple extends true ? string[][] : string[], API>;
  showCheckedStrategy?: CascaderProps<any>['showCheckedStrategy'];
  useAntdDisplayRender?: boolean;
  displayRender?: CascaderProps<CasCaderOption>['displayRender'] | null;
}

export interface FieldCustomizeItem<API extends API_Method = API_Method> extends FieldBaseItem {
  type: 'customize';
  defaultValue?: any;
  toParam?: ToParam<any, API>;
  render: React.ReactNode;
}

export type FieldItem<API extends API_Method = API_Method> =
  | FieldInputItem<API>
  | FieldSelectItem<API>
  | FieldDateTypeItem<API>
  | FieldDateRangeItem<API>
  | FieldCascaderItem<API>
  | FieldCustomizeItem<API>;

export interface CachedSetting {
  [key: string]: { visible?: boolean };
}

export type CachedFields = Array<
  {
    attributes?: any;
    visible?: boolean;
  } & Pick<FieldItem, 'key' | 'label' | 'type'>
>;
