import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import moment from 'moment';
import dayjs from 'dayjs';
import DatePicker from '../DatePicker';

jest.mock('antd', () => {
  const ReactModule = require('react');
  const Single = ReactModule.forwardRef((props: any, _ref: any) => (
    <>
      <span data-testid='single-value'>{props.value ? props.value.format('YYYY-MM-DD') : ''}</span>
      <span data-testid='single-panel-change'> </span>
      <button
        type='button'
        onClick={() => props.onCalendarChange(dayjs('2024-01-05'), '2024-01-05', {})}
      >
        触发 Single onCalendarChange
      </button>
      <button
        type='button'
        onClick={() => props.disabledTime && props.disabledTime(dayjs('2024-01-05 10:30'))}
      >
        触发 Single disabledTime
      </button>
      <span data-testid='single-showtime-default'>
        {props.showTime && typeof props.showTime === 'object' && props.showTime.defaultValue
          ? `dayjs:${dayjs.isDayjs(props.showTime.defaultValue)}:${props.showTime.defaultValue.format('HH:mm:ss')}`
          : ''}
      </span>
      <button type='button' onClick={() => props.onPanelChange(dayjs('2024-01-05'), 'month')}>
        触发 Single onPanelChange
      </button>
      <span data-testid='single-date-cell'>
        {props.cellRender
          ? props.cellRender(dayjs('2024-01-05'), {
              panel: 'date',
              originNode: <i>origin</i>,
            })
          : 'no-cellRender'}
      </span>
      <span data-testid='single-month-cell'>
        {props.cellRender
          ? props.cellRender(dayjs('2024-01-05'), {
              panel: 'month',
              originNode: <i>origin-month</i>,
            })
          : 'no-cellRender'}
      </span>
    </>
  ));
  const Range = ReactModule.forwardRef((props: any, _ref: any) => (
    <>
      <span data-testid='range-value'>
        {props.value ? props.value.map((v: any) => v && v.format('YYYY-MM-DD')).join('~') : ''}
      </span>
      <button
        type='button'
        onClick={() =>
          props.onCalendarChange([dayjs('2024-01-05'), null], ['2024-01-05', ''], {
            range: 'start',
          })
        }
      >
        触发 Range onCalendarChange
      </button>
      <button
        type='button'
        onClick={() => props.disabledTime && props.disabledTime(dayjs('2024-01-05 10:30'), 'end')}
      >
        触发 Range disabledTime
      </button>
      <button
        type='button'
        onClick={() =>
          props.onOk && props.onOk([dayjs('2024-01-05 08:00'), dayjs('2024-01-06 09:00')])
        }
      >
        触发 Range onOk
      </button>
      <span data-testid='range-showtime-default'>
        {props.showTime && typeof props.showTime === 'object' && props.showTime.defaultValue
          ? props.showTime.defaultValue
              .map((v: any) => `dayjs:${dayjs.isDayjs(v)}@${v.format('HH:mm:ss')}`)
              .join(',')
          : ''}
      </span>
    </>
  ));
  return { DatePicker: Object.assign(Single, { RangePicker: Range }) };
});

describe('GmDatePicker v4 兼容: 回调统一返回 Moment', () => {
  it('Single onCalendarChange 回调收到 moment 而非 dayjs', () => {
    let received: any;
    render(<DatePicker onCalendarChange={(v) => (received = v)} />);
    fireEvent.click(screen.getByText('触发 Single onCalendarChange'));
    expect(moment.isMoment(received)).toBe(true);
    expect(received.format('YYYY-MM-DD')).toBe('2024-01-05');
  });

  it('Single onPanelChange 回调收到 moment', () => {
    let received: any;
    let mode: any;
    render(<DatePicker onPanelChange={(v, m) => ((received = v), (mode = m))} />);
    fireEvent.click(screen.getByText('触发 Single onPanelChange'));
    expect(moment.isMoment(received)).toBe(true);
    expect(mode).toBe('month');
  });

  it('Range onCalendarChange 回调收到 moment 元组(选择中途第二项为 null)', () => {
    let received: any;
    let info: any;
    render(<DatePicker.RangePicker onCalendarChange={(dates, _ds, i) => ((received = dates), (info = i))} />);
    fireEvent.click(screen.getByText('触发 Range onCalendarChange'));
    expect(moment.isMoment(received[0])).toBe(true);
    expect(received[1]).toBe(null);
    expect(received[0].format('YYYY-MM-DD')).toBe('2024-01-05');
    expect(info.range).toBe('start');
  });

  it('v4 dateRender(moment) 映射为 antd5 cellRender: 日期面板生效,其余面板回退 originNode', () => {
    render(
      <DatePicker
        dateRender={(current) => <b>{current.format('MM/DD')}</b>}
      />,
    );
    expect(screen.getByTestId('single-date-cell').textContent).toBe('01/05');
    expect(screen.getByTestId('single-month-cell').textContent).toBe('origin-month');
  });

  it('Single showTime.defaultValue 接受 Moment,转为 dayjs 传入 antd5', () => {
    render(<DatePicker showTime={{ defaultValue: moment('1970-01-01T00:05:00') }} />);
    const text = screen.getByTestId('single-showtime-default').textContent ?? '';
    expect(text).toContain('dayjs:true');
    expect(text).toContain('00:05:00');
  });

  it('Range showTime.defaultValue 接受 [Moment, Moment] 元组,转为 dayjs 数组传入 antd5', () => {
    render(
      <DatePicker.RangePicker
        showTime={{ defaultValue: [moment('1970-01-01T00:00:00'), moment('1970-01-01T23:59:59')] }}
      />,
    );
    const text = screen.getByTestId('range-showtime-default').textContent ?? '';
    expect(text).toContain('dayjs:true@00:00:00');
    expect(text).toContain('dayjs:true@23:59:59');
  });

  it('Single disabledTime 回调收到 moment 而非 dayjs', () => {
    let received: any;
    let returned: any;
    render(
      <DatePicker
        disabledTime={(current) => {
          received = current;
          return { disabledHours: () => [1, 2] };
        }}
      />,
    );
    fireEvent.click(screen.getByText('触发 Single disabledTime'));
    expect(moment.isMoment(received)).toBe(true);
    expect(received.format('YYYY-MM-DD HH:mm')).toBe('2024-01-05 10:30');
  });

  it('Range disabledTime 回调收到 moment,并保留 type 参数', () => {
    let received: any;
    let type: any;
    render(
      <DatePicker.RangePicker
        disabledTime={(date, t) => {
          received = date;
          type = t;
          return {};
        }}
      />,
    );
    fireEvent.click(screen.getByText('触发 Range disabledTime'));
    expect(moment.isMoment(received)).toBe(true);
    expect(received.format('YYYY-MM-DD HH:mm')).toBe('2024-01-05 10:30');
    expect(type).toBe('end');
  });

  it('Range onOk 回调收到 moment 元组', () => {
    let received: any;
    render(<DatePicker.RangePicker onOk={(v) => (received = v)} />);
    fireEvent.click(screen.getByText('触发 Range onOk'));
    expect(moment.isMoment(received[0])).toBe(true);
    expect(moment.isMoment(received[1])).toBe(true);
    expect(received[0].format('YYYY-MM-DD HH:mm')).toBe('2024-01-05 08:00');
    expect(received[1].format('YYYY-MM-DD HH:mm')).toBe('2024-01-06 09:00');
  });

  it('显式 cellRender 回调也收到 moment(所有面板)', () => {
    const receivedTypes: boolean[] = [];
    render(
      <DatePicker
        cellRender={(current: any, info: any) => {
          receivedTypes.push(moment.isMoment(current));
          return info.panel === 'date' ? (
            <b>{current.format('MM/DD')}</b>
          ) : (
            <i>{current.format('YYYY')}</i>
          );
        }}
      />,
    );
    expect(screen.getByTestId('single-date-cell').textContent).toBe('01/05');
    expect(screen.getByTestId('single-month-cell').textContent).toBe('2024');
    expect(receivedTypes).toEqual([true, true]);
  });

  it('v4 monthCellRender(moment) 映射为 cellRender:月份面板生效,日期面板回退 originNode', () => {
    const receivedTypes: boolean[] = [];
    render(
      <DatePicker
        monthCellRender={(current) => {
          receivedTypes.push(moment.isMoment(current));
          return <b>{current.format('YYYY年M月')}</b>;
        }}
      />,
    );
    expect(screen.getByTestId('single-date-cell').textContent).toBe('origin');
    expect(screen.getByTestId('single-month-cell').textContent).toBe('2024年1月');
    expect(receivedTypes).toEqual([true]);
  });

  it('v4 dateFullCellRender 优先于 dateRender,且同样收到 moment', () => {
    render(
      <DatePicker
        dateRender={(current) => <b>R:{current.format('MM/DD')}</b>}
        dateFullCellRender={(current) => <b>F:{current.format('MM/DD')}</b>}
      />,
    );
    expect(screen.getByTestId('single-date-cell').textContent).toBe('F:01/05');
    expect(screen.getByTestId('single-month-cell').textContent).toBe('origin-month');
  });
});
