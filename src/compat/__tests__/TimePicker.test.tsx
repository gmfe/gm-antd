import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import moment from 'moment';
import dayjs from 'dayjs';
import TimePicker from '../TimePicker';

jest.mock('antd', () => {
  const ReactModule = require('react');
  const Single = ReactModule.forwardRef((props: any, _ref: any) => (
    <>
      <span data-testid="single-value">
        {props.value ? props.value.format('HH:mm:ss') : ''}
      </span>
      <span data-testid="single-default">
        {props.defaultValue ? props.defaultValue.format('HH:mm:ss') : ''}
      </span>
      <button
        type="button"
        onClick={() => props.onChange(dayjs('2024-01-01T09:30:00'), '09:30:00')}
      >
        触发 onChange
      </button>
    </>
  ));
  const Range = ReactModule.forwardRef((props: any, _ref: any) => (
    <>
      <span data-testid="range-value">
        {props.value ? props.value.map((v: any) => v.format('HH:mm')).join('~') : ''}
      </span>
      <button
        type="button"
        onClick={() =>
          props.onChange(
            [dayjs('2024-01-01T08:00:00'), dayjs('2024-01-01T12:00:00')],
            ['08:00', '12:00'],
          )
        }
      >
        触发 Range onChange
      </button>
    </>
  ));
  return { TimePicker: Object.assign(Single, { RangePicker: Range }) };
});

describe('GmTimePicker', () => {
  it('moment value/defaultValue 转为 dayjs 传入 antd5 TimePicker', () => {
    render(
      <TimePicker
        value={moment('2024-01-01T08:30:00')}
        defaultValue={moment('2024-01-01T00:00:00')}
      />,
    );
    expect(screen.getByTestId('single-value').textContent).toBe('08:30:00');
    expect(screen.getByTestId('single-default').textContent).toBe('00:00:00');
  });

  it('moment value 引用每次 render 变化时, dayjs value 保持稳定(仅时间戳变化才重建)', () => {
    const initial = moment('2024-01-01T08:30:00');
    const { rerender } = render(<TimePicker value={initial} />);
    expect(screen.getByTestId('single-value').textContent).toBe('08:30:00');

    // erp 场景: 每次 render 都新建 moment 实例(时间戳相同)
    rerender(<TimePicker value={moment('2024-01-01T08:30:00')} />);
    expect(screen.getByTestId('single-value').textContent).toBe('08:30:00');
  });

  it('value 为 null 时透传空', () => {
    render(<TimePicker value={null} />);
    expect(screen.getByTestId('single-value').textContent).toBe('');
  });

  it('onChange 回调把 dayjs 转回 moment, 并透传 timeString', () => {
    const onChange = jest.fn();
    render(<TimePicker value={moment('2024-01-01T08:30:00')} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: '触发 onChange' }));
    expect(onChange).toHaveBeenCalledTimes(1);
    const [momentValue, timeString] = onChange.mock.calls[0];
    expect(moment.isMoment(momentValue)).toBe(true);
    expect(momentValue.format('HH:mm:ss')).toBe('09:30:00');
    expect(timeString).toBe('09:30:00');
  });

  it('RangePicker: moment 元组转入为 dayjs, onChange 转回 moment 元组', () => {
    const onChange = jest.fn();
    render(
      <TimePicker.RangePicker
        value={[moment('2024-01-01T08:00:00'), moment('2024-01-01T12:00:00')]}
        onChange={onChange}
      />,
    );
    expect(screen.getByTestId('range-value').textContent).toBe('08:00~12:00');

    fireEvent.click(screen.getByRole('button', { name: '触发 Range onChange' }));
    const [tuple] = onChange.mock.calls[0];
    expect(tuple).toHaveLength(2);
    tuple.forEach((m: any) => expect(moment.isMoment(m)).toBe(true));
    expect(tuple.map((m: any) => m.format('HH:mm'))).toEqual(['08:00', '12:00']);
  });
});
