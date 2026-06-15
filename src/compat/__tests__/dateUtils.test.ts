import dayjs from 'dayjs';
import moment from 'moment-timezone';
import { momentToDayjs, dayjsToMoment, momentTupleToDayjs, dayjsTupleToMoment } from '../dateUtils';

describe('momentToDayjs / dayjsToMoment', () => {
  it('round-trip 保持绝对时刻(epoch ms)', () => {
    const m = moment('2026-06-12T10:00:00Z');
    const d = momentToDayjs(m)!;
    expect(d.valueOf()).toBe(m.valueOf());
    const back = dayjsToMoment(d)!;
    expect(back.valueOf()).toBe(m.valueOf());
  });

  it('时区感知:moment.tz → dayjs.tz round-trip 保持显示时区名', () => {
    const m = moment.tz('2026-06-12 10:00:00', 'Asia/Tokyo');
    const d = momentToDayjs(m)!;
    expect((d as any).$x?.$timezone).toBe('Asia/Tokyo');
    const back = dayjsToMoment(d)!;
    expect(back.tz()).toBe('Asia/Tokyo');
    expect(back.valueOf()).toBe(m.valueOf());
  });

  it('null/undefined 原样返回', () => {
    expect(momentToDayjs(null)).toBeNull();
    expect(momentToDayjs(undefined)).toBeUndefined();
    expect(dayjsToMoment(null)).toBeNull();
  });
});

describe('RangePicker 元组(null-aware)', () => {
  it('moment 元组 → dayjs 元组', () => {
    const t = [moment('2026-01-01'), moment('2026-02-01')] as [moment.Moment, moment.Moment];
    const d = momentTupleToDayjs(t)!;
    expect(d[0].valueOf()).toBe(t[0].valueOf());
    expect(d[1].valueOf()).toBe(t[1].valueOf());
  });

  it('dayjs 元组(含 null 中途值)→ moment 元组,null 保留', () => {
    const t: [dayjs.Dayjs | null, dayjs.Dayjs | null] = [dayjs('2026-01-01'), null];
    const m = dayjsTupleToMoment(t)!;
    expect(m[0].valueOf()).toBe(dayjs('2026-01-01').valueOf());
    expect(m[1]).toBeNull();
  });

  it('null 输入返回 null', () => {
    expect(momentTupleToDayjs(null)).toBeNull();
    expect(dayjsTupleToMoment(null)).toBeNull();
  });
});
