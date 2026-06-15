import dayjs, { type Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import moment from 'moment-timezone';
import type { Moment } from 'moment';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

/** 从 moment 实例取 IANA 时区名(moment-timezone 存于 _z)。 */
function tzOfMoment(m: Moment): string | undefined {
  const z = (m as any)._z;
  return z?.name ?? (m as any)?.$x?.$timezone;
}

/** 从 dayjs 实例取时区名(dayjs.tz 存于 $x.$timezone)。 */
function tzOfDayjs(d: Dayjs): string | undefined {
  return (d as any)?.$x?.$timezone;
}

/** moment → dayjs,时区感知。null/undefined 原样返回。 */
export function momentToDayjs(m: Moment | null | undefined): Dayjs | null | undefined {
  if (m == null) return m as null | undefined;
  const tz = tzOfMoment(m);
  return tz ? dayjs.tz(m.valueOf(), tz) : dayjs(m.valueOf());
}

/** dayjs → moment,时区感知。null/undefined 原样返回。 */
export function dayjsToMoment(d: Dayjs | null | undefined): Moment | null | undefined {
  if (d == null) return d as null | undefined;
  const tz = tzOfDayjs(d);
  return tz ? moment.tz(d.valueOf(), tz) : moment(d.valueOf());
}

/** [Moment,Moment] → [Dayjs,Dayjs];null 输入返回 null。 */
export function momentTupleToDayjs(
  t: [Moment, Moment] | null | undefined,
): [Dayjs, Dayjs] | null {
  if (!t) return null;
  return [momentToDayjs(t[0]) as Dayjs, momentToDayjs(t[1]) as Dayjs];
}

/**
 * [Dayjs,Dayjs] (或选择中途的 [Dayjs|null, Dayjs|null]) → moment 元组。
 * null 元素保留为 null(RangePicker 选择中途值)。
 */
export function dayjsTupleToMoment(
  t: [Dayjs | null, Dayjs | null] | null | undefined,
): [Moment | null, Moment | null] | null {
  if (!t) return null;
  return [dayjsToMoment(t[0]) ?? null, dayjsToMoment(t[1]) ?? null];
}
