import React from 'react';
import { DatePicker as AntDatePicker } from 'antd';
import type { DatePickerProps as AntDatePickerProps } from 'antd';
// antd5 公共入口不导出 RangePickerProps, 暂用深路径(无公共替代)
import type { RangePickerProps as AntRangePickerProps } from 'antd/lib/date-picker';
import type { Moment } from 'moment';
import type { Dayjs } from 'dayjs';
import { momentToDayjs, dayjsToMoment, momentTupleToDayjs, dayjsTupleToMoment } from './dateUtils';
import { transformBordered } from './withBaseSelectCompat';

/** v4 兼容:value/defaultValue 等接受 Moment;onChange 回调返回 Moment。 */
export interface CompatDatePickerProps
  extends Omit<
    AntDatePickerProps,
    'value' | 'defaultValue' | 'defaultPickerValue' | 'pickerValue' | 'onChange' | 'onOk' | 'disabledDate' | 'disabledTime'
  > {
  value?: Moment;
  defaultValue?: Moment;
  defaultPickerValue?: Moment;
  pickerValue?: Moment;
  onChange?: (value: Moment | null, dateString: string) => void;
  onOk?: (value: Moment | null) => void;
  disabledDate?: (current: Moment) => boolean;
  disabledTime?: AntDatePickerProps['disabledTime'];
}

function CompatSingle(props: CompatDatePickerProps, ref: React.Ref<any>) {
  const {
    value,
    defaultValue,
    defaultPickerValue,
    pickerValue,
    onChange,
    onOk,
    disabledDate,
    showTime,
    ...rest
  } = props;

  // showTime 若为对象且含 moment defaultValue,转 dayjs
  let compatShowTime: any = showTime;
  if (showTime && typeof showTime === 'object') {
    const st = showTime as any;
    compatShowTime = {
      ...st,
      ...(st.defaultValue ? { defaultValue: momentToDayjs(st.defaultValue) ?? undefined } : {}),
    };
  }

  return (
    <AntDatePicker
      ref={ref}
      {...(transformBordered(rest as any) as AntDatePickerProps)}
      value={value ? (momentToDayjs(value) ?? undefined) : undefined}
      defaultValue={defaultValue ? (momentToDayjs(defaultValue) ?? undefined) : undefined}
      defaultPickerValue={defaultPickerValue ? (momentToDayjs(defaultPickerValue) ?? undefined) : undefined}
      pickerValue={pickerValue ? (momentToDayjs(pickerValue) ?? undefined) : undefined}
      showTime={compatShowTime}
      disabledDate={disabledDate ? (d: Dayjs) => disabledDate(dayjsToMoment(d)!) : undefined}
      onChange={(d, ds) => onChange?.(d ? dayjsToMoment(d) ?? null : null, ds as string)}
      onOk={onOk ? (d: Dayjs) => onOk(d ? dayjsToMoment(d) ?? null : null) : undefined}
    />
  );
}

export interface CompatRangePickerProps
  extends Omit<
    AntRangePickerProps,
    'value' | 'defaultValue' | 'defaultPickerValue' | 'onChange' | 'disabledDate'
  > {
  value?: [Moment, Moment] | null;
  defaultValue?: [Moment, Moment] | null;
  defaultPickerValue?: [Moment, Moment] | null;
  onChange?: (value: [Moment | null, Moment | null] | null, dateString: [string, string]) => void;
  disabledDate?: (current: Moment) => boolean;
}

function CompatRange(props: CompatRangePickerProps, ref: React.Ref<any>) {
  const { value, defaultValue, defaultPickerValue, onChange, disabledDate, ...rest } = props;
  return (
    <AntDatePicker.RangePicker
      ref={ref}
      {...(transformBordered(rest as any) as AntRangePickerProps)}
      value={momentTupleToDayjs(value as any) ?? undefined}
      defaultValue={momentTupleToDayjs(defaultValue as any) ?? undefined}
      defaultPickerValue={momentTupleToDayjs(defaultPickerValue as any) ?? undefined}
      disabledDate={disabledDate ? (d: Dayjs) => disabledDate(dayjsToMoment(d)!) : undefined}
      onChange={(d, ds) =>
        onChange?.(d ? (dayjsTupleToMoment(d as any) as any) : null, ds as [string, string])
      }
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
