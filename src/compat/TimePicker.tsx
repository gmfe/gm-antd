import React from 'react';
import { TimePicker as AntTimePicker } from 'antd';
import type {
  TimePickerProps as AntTimePickerProps,
  TimeRangePickerProps as AntTimeRangePickerProps,
} from 'antd';
import type { Moment } from 'moment';
import type { Dayjs } from 'dayjs';
import { momentToDayjs, dayjsToMoment, momentTupleToDayjs, dayjsTupleToMoment } from './dateUtils';
import { transformBordered } from './withBaseSelectCompat';

/**
 * v4 兼容:value/defaultValue 等接受 Moment;onChange 回调返回 Moment。
 * antd5 TimePicker 基于 rc-picker(假定 dayjs 不可变实例),直接透传 moment 会因
 * moment.hour() 原地修改导致时间值未操作自行跳变,故在此双向转换。
 */
export interface CompatTimePickerProps
  extends Omit<AntTimePickerProps, 'value' | 'defaultValue' | 'onChange' | 'onOk'> {
  value?: Moment | null;
  defaultValue?: Moment | null;
  onChange?: (value: Moment | null, timeString: string | string[]) => void;
  onOk?: (value: Moment | null) => void;
}

function CompatSingle(props: CompatTimePickerProps, ref: React.Ref<any>) {
  const { value, defaultValue, onChange, onOk, ...rest } = props;

  // 稳定 dayjs value 引用，避免每次 render 新实例干扰 rc-picker 内部状态
  const dayjsValue = React.useMemo(
    () => (value ? (momentToDayjs(value) ?? undefined) : undefined),
    [value?.valueOf?.() ?? null],
  );

  return (
    <AntTimePicker
      ref={ref}
      {...(transformBordered(rest as any) as AntTimePickerProps)}
      value={dayjsValue}
      defaultValue={defaultValue ? (momentToDayjs(defaultValue) ?? undefined) : undefined}
      onChange={(d, ts) => onChange?.(d ? dayjsToMoment(d) ?? null : null, ts as string | string[])}
      onOk={onOk ? (d: Dayjs) => onOk(d ? dayjsToMoment(d) ?? null : null) : undefined}
    />
  );
}

export interface CompatTimeRangePickerProps
  extends Omit<AntTimeRangePickerProps, 'value' | 'defaultValue' | 'onChange' | 'onOk'> {
  value?: [Moment, Moment] | null;
  defaultValue?: [Moment, Moment] | null;
  onChange?: (
    value: [Moment | null, Moment | null] | null,
    timeString: [string, string],
  ) => void;
  onOk?: (value: [Moment | null, Moment | null] | null) => void;
}

function CompatRange(props: CompatTimeRangePickerProps, ref: React.Ref<any>) {
  const { value, defaultValue, onChange, onOk, ...rest } = props;
  // 稳定 dayjs value 引用：仅当 moment 值的 timestamp 变化时才重新转换，
  // 避免每次 render 新建 dayjs 实例导致 rc-picker 内部 selectedValue 被重置
  const dayjsValue = React.useMemo(
    () => momentTupleToDayjs(value as any) ?? undefined,
    [value?.[0]?.valueOf?.() ?? null, value?.[1]?.valueOf?.() ?? null],
  );
  return (
    <AntTimePicker.RangePicker
      ref={ref}
      {...(transformBordered(rest as any) as AntTimeRangePickerProps)}
      value={dayjsValue}
      defaultValue={momentTupleToDayjs(defaultValue as any) ?? undefined}
      onChange={(d, ts) =>
        onChange?.(d ? (dayjsTupleToMoment(d as any) as any) : null, ts as [string, string])
      }
      onOk={
        onOk
          ? (d) => onOk(d ? (dayjsTupleToMoment(d as any) as any) : null)
          : undefined
      }
    />
  );
}

const ForwardedSingle = React.forwardRef(CompatSingle);

type CompatTimePicker = typeof ForwardedSingle & {
  RangePicker: React.ForwardRefExoticComponent<
    CompatTimeRangePickerProps & React.RefAttributes<any>
  >;
};

const TimePicker = ForwardedSingle as CompatTimePicker;
TimePicker.RangePicker = React.forwardRef(CompatRange);
(TimePicker as any).displayName = 'GmTimePicker';

export default TimePicker;
