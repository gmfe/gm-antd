import React from 'react';
import { DatePicker as AntDatePicker } from 'antd';
import type { DatePickerProps as AntDatePickerProps } from 'antd';
// antd5 公共入口不导出 RangePickerProps, 暂用深路径(无公共替代)
import type { RangePickerProps as AntRangePickerProps } from 'antd/lib/date-picker';
import type { Moment } from 'moment';
import type { Dayjs } from 'dayjs';
import { momentToDayjs, dayjsToMoment, momentTupleToDayjs, dayjsTupleToMoment } from './dateUtils';
import { transformBordered } from './withBaseSelectCompat';

/** v4 兼容:value/defaultValue 等接受 Moment;onChange/onCalendarChange/onPanelChange 等回调统一返回 Moment。 */
export interface CompatDatePickerProps
  extends Omit<
    AntDatePickerProps,
    | 'value'
    | 'defaultValue'
    | 'defaultPickerValue'
    | 'pickerValue'
    | 'onChange'
    | 'onOk'
    | 'disabledDate'
    | 'disabledTime'
    | 'onCalendarChange'
    | 'onPanelChange'
    | 'cellRender'
    | 'dateRender'
    | 'showTime'
  > {
  value?: Moment;
  defaultValue?: Moment;
  defaultPickerValue?: Moment;
  pickerValue?: Moment;
  onChange?: (value: Moment | null, dateString: string) => void;
  onOk?: (value: Moment | null) => void;
  disabledDate?: (current: Moment) => boolean;
  disabledTime?: AntDatePickerProps['disabledTime'];
  onCalendarChange?: (value: Moment | null, dateString: string, info: any) => void;
  onPanelChange?: (value: Moment, mode: any) => void;
  /** v4 dateRender(moment) 自动映射为 antd5 cellRender;显式传 cellRender 时优先 cellRender */
  dateRender?: (current: Moment) => React.ReactNode;
  cellRender?: AntDatePickerProps['cellRender'];
  /** v4 兼容:showTime.defaultValue 接受 Moment,内部转为 dayjs */
  showTime?: boolean | CompatShowTime<NonNullable<AntDatePickerProps['showTime']>>;
}

/**
 * v4 dateRender(moment) → antd5 cellRender(dayjs):仅日期面板生效,其余面板回退默认渲染。
 * 显式传入的 cellRender 优先(调用方自行处理 dayjs)。
 */
function dateRenderToCellRender(
  dateRender: ((current: Moment) => React.ReactNode) | undefined,
  cellRender: ((current: Dayjs, info: any) => React.ReactNode) | undefined,
) {
  if (cellRender) return cellRender;
  if (!dateRender) return undefined;
  return (d: Dayjs, info: any) => (info.panel === 'date' ? dateRender(dayjsToMoment(d)!) : info.originNode);
}

/** showTime 兼容类型:defaultValue 接受 Moment(单选)或 Moment/Moment 元组(Range)。 */
type CompatShowTime<T> = Omit<Exclude<T, boolean | undefined | null>, 'defaultValue'> & {
  defaultValue?: Moment | [Moment, Moment];
};

/**
 * showTime.defaultValue moment → dayjs(单值或元组逐项转换)。
 * 之前 Single 的内联转换只处理单值,数组会得 Invalid Date;Range 则裸透传依赖鸭子类型,此处统一收口。
 */
function compatShowTime<T extends object>(showTime: boolean | T | undefined): boolean | T | undefined {
  if (!showTime || typeof showTime !== 'object') return showTime;
  const { defaultValue, ...rest } = showTime as any;
  if (defaultValue == null) return showTime;
  const converted = Array.isArray(defaultValue)
    ? defaultValue.map((d: any) => momentToDayjs(d))
    : momentToDayjs(defaultValue);
  return { ...rest, defaultValue: converted };
}

function CompatSingle(props: CompatDatePickerProps, ref: React.Ref<any>) {
  const {
    value,
    defaultValue,
    defaultPickerValue,
    pickerValue,
    onChange,
    onOk,
    onCalendarChange,
    onPanelChange,
    disabledDate,
    showTime,
    dateRender,
    cellRender,
    ...rest
  } = props;

  // 稳定 dayjs value 引用，避免每次 render 新实例干扰 rc-picker 内部状态
  const dayjsValue = React.useMemo(
    () => (value ? (momentToDayjs(value) ?? undefined) : undefined),
    [value?.valueOf?.() ?? null],
  );

  return (
    <AntDatePicker
      ref={ref}
      {...(transformBordered(rest as any) as AntDatePickerProps)}
      value={dayjsValue}
      defaultValue={defaultValue ? (momentToDayjs(defaultValue) ?? undefined) : undefined}
      defaultPickerValue={defaultPickerValue ? (momentToDayjs(defaultPickerValue) ?? undefined) : undefined}
      pickerValue={pickerValue ? (momentToDayjs(pickerValue) ?? undefined) : undefined}
      showTime={compatShowTime(showTime) as any}
      disabledDate={disabledDate ? (d: Dayjs) => disabledDate(dayjsToMoment(d)!) : undefined}
      onChange={(d, ds) => onChange?.(d ? dayjsToMoment(d) ?? null : null, ds as string)}
      onOk={onOk ? (d: Dayjs) => onOk(d ? dayjsToMoment(d) ?? null : null) : undefined}
      onCalendarChange={
        onCalendarChange
          ? (d: Dayjs | Dayjs[] | null, ds: string, info: any) =>
              // 单选面板运行时只会是 Dayjs | null(联合类型为 antd5 声明共享所致),数组防御性归 null
              onCalendarChange(d && !Array.isArray(d) ? dayjsToMoment(d) ?? null : null, ds, info)
          : undefined
      }
      onPanelChange={onPanelChange ? (d: Dayjs, mode: any) => onPanelChange(dayjsToMoment(d)!, mode) : undefined}
      cellRender={dateRenderToCellRender(dateRender, cellRender)}
    />
  );
}

export interface CompatRangePickerProps
  extends Omit<
    AntRangePickerProps,
    | 'value'
    | 'defaultValue'
    | 'defaultPickerValue'
    | 'onChange'
    | 'disabledDate'
    | 'onCalendarChange'
    | 'onPanelChange'
    | 'cellRender'
    | 'dateRender'
    | 'showTime'
  > {
  value?: [Moment, Moment] | null;
  defaultValue?: [Moment, Moment] | null;
  defaultPickerValue?: [Moment, Moment] | null;
  onChange?: (value: [Moment | null, Moment | null] | null, dateString: [string, string]) => void;
  disabledDate?: (current: Moment) => boolean;
  onCalendarChange?: (
    dates: [Moment | null, Moment | null] | null,
    dateStrings: [string, string],
    info: any,
  ) => void;
  onPanelChange?: (value: [Moment, Moment], mode: any) => void;
  /** v4 dateRender(moment) 自动映射为 antd5 cellRender;显式传 cellRender 时优先 cellRender */
  dateRender?: (current: Moment) => React.ReactNode;
  cellRender?: AntRangePickerProps['cellRender'];
  /** v4 兼容:showTime.defaultValue 接受 Moment 或 [Moment, Moment] 元组,内部转为 dayjs */
  showTime?: boolean | CompatShowTime<NonNullable<AntRangePickerProps['showTime']>>;
}

function CompatRange(props: CompatRangePickerProps, ref: React.Ref<any>) {
  const {
    value,
    defaultValue,
    defaultPickerValue,
    onChange,
    onCalendarChange,
    onPanelChange,
    disabledDate,
    dateRender,
    cellRender,
    showTime,
    ...rest
  } = props;
  // 稳定 dayjs value 引用：仅当 moment 值的 timestamp 变化时才重新转换，
  // 避免每次 render 新建 dayjs 实例导致 rc-picker 内部 selectedValue 被重置、选择交互错乱
  const dayjsValue = React.useMemo(
    () => momentTupleToDayjs(value as any) ?? undefined,
    [value?.[0]?.valueOf?.() ?? null, value?.[1]?.valueOf?.() ?? null],
  );
  return (
    <AntDatePicker.RangePicker
      ref={ref}
      {...(transformBordered(rest as any) as AntRangePickerProps)}
      value={dayjsValue}
      defaultValue={momentTupleToDayjs(defaultValue as any) ?? undefined}
      defaultPickerValue={momentTupleToDayjs(defaultPickerValue as any) ?? undefined}
      disabledDate={disabledDate ? (d: Dayjs) => disabledDate(dayjsToMoment(d)!) : undefined}
      onChange={(d, ds) =>
        onChange?.(d ? (dayjsTupleToMoment(d as any) as any) : null, ds as [string, string])
      }
      onCalendarChange={
        onCalendarChange
          ? (d: [Dayjs | null, Dayjs | null] | null, ds: [string, string], info: any) =>
              onCalendarChange(dayjsTupleToMoment(d) as any, ds, info)
          : undefined
      }
      onPanelChange={
        onPanelChange
          ? (d: [Dayjs, Dayjs], mode: any) =>
              onPanelChange([dayjsToMoment(d[0])!, dayjsToMoment(d[1])!] as [Moment, Moment], mode)
          : undefined
      }
      cellRender={dateRenderToCellRender(dateRender, cellRender) as any}
      showTime={compatShowTime(showTime) as any}
    />
  );
}

const ForwardedSingle = React.forwardRef(CompatSingle);

type CompatDatePicker = typeof ForwardedSingle & {
  RangePicker: React.ForwardRefExoticComponent<CompatRangePickerProps & React.RefAttributes<any>>;
};

const DatePicker = ForwardedSingle as CompatDatePicker;
DatePicker.RangePicker = React.forwardRef(CompatRange);
(DatePicker as any).displayName = 'GmDatePicker';

export default DatePicker;
