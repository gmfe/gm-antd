import React, { useState } from 'react';
import moment from 'moment';
import { DatePicker, Space } from 'gm-antd';

const { RangePicker } = DatePicker;

/**
 * DatePicker 兼容垫片全面 demo:业务沿用 v4 的 moment 取值,垫片自动 moment↔dayjs 转换。
 * 覆盖:基础单选 / 日期时间(showTime) / 范围(RangePicker) / 禁用日期 / picker 模式(年/月/季/周)。
 * - value 传 moment,垫片转 dayjs 给 antd5
 * - onChange 回调拿到的 value 是 moment(不是 dayjs)
 */
export default () => {
  const [single, setSingle] = useState<moment.Moment | null>(moment('2024-06-15'));
  const [datetime, setDatetime] = useState<moment.Moment | null>(null);
  const [range, setRange] = useState<[moment.Moment, moment.Moment] | null>(null);

  // 禁用今天之后的日期(current 回调参数为 moment)
  const disabledDate = (current: moment.Moment) => !!(current && current > moment().endOf('day'));

  return (
    <Space direction="vertical" size={20} style={{ width: '100%' }}>
      <div>
        <div style={{ marginBottom: 8, color: 'rgba(0,0,0,0.45)' }}>
          基础日期(单选,value/onChange 均为 moment)
        </div>
        <DatePicker
          value={single ?? undefined}
          onChange={v => {
            setSingle(v);
            // eslint-disable-next-line no-console
            console.log('single onChange:', v?.format('YYYY-MM-DD'), 'isMoment:', moment.isMoment(v));
          }}
        />
      </div>

      <div>
        <div style={{ marginBottom: 8, color: 'rgba(0,0,0,0.45)' }}>日期 + 时间(showTime)</div>
        <DatePicker
          showTime
          format="YYYY-MM-DD HH:mm:ss"
          value={datetime ?? undefined}
          onChange={v => setDatetime(v)}
        />
      </div>

      <div>
        <div style={{ marginBottom: 8, color: 'rgba(0,0,0,0.45)' }}>
          范围选择(RangePicker,[moment, moment])
        </div>
        <RangePicker
          value={range}
          onChange={v => setRange(v as [moment.Moment, moment.Moment] | null)}
        />
      </div>

      <div>
        <div style={{ marginBottom: 8, color: 'rgba(0,0,0,0.45)' }}>禁用未来日期(disabledDate)</div>
        <DatePicker disabledDate={disabledDate} />
      </div>

      <div>
        <div style={{ marginBottom: 8, color: 'rgba(0,0,0,0.45)' }}>选择器模式(picker)</div>
        <Space size={12} wrap>
          <DatePicker picker="year" placeholder="年" />
          <DatePicker picker="month" placeholder="月" />
          <DatePicker picker="quarter" placeholder="季度" />
          <DatePicker picker="week" placeholder="周" />
        </Space>
      </div>
    </Space>
  );
}
