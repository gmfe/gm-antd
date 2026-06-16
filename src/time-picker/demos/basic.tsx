import React, { useState } from 'react';
import dayjs from 'dayjs';
import { TimePicker, Space } from 'gm-antd';

const { RangePicker } = TimePicker;

/**
 * TimePicker 直接透传 antd5(用 dayjs,无 moment 兼容)。
 * 覆盖:受控单选 / 默认值 / 十二小时制 / 范围 / 禁用时段 / 步进。
 */
export default () => {
  const [value, setValue] = useState<dayjs.Dayjs | null>(dayjs('12:08:23', 'HH:mm:ss'));

  return (
    <Space direction="vertical" size={20} style={{ width: '100%' }}>
      <div>
        <div style={{ marginBottom: 8, color: 'rgba(0,0,0,0.45)' }}>基础(受控,value 为 dayjs)</div>
        <TimePicker value={value} onChange={setValue} />
      </div>

      <div>
        <div style={{ marginBottom: 8, color: 'rgba(0,0,0,0.45)' }}>默认值(非受控)</div>
        <TimePicker defaultValue={dayjs('00:00:00', 'HH:mm:ss')} />
      </div>

      <div>
        <div style={{ marginBottom: 8, color: 'rgba(0,0,0,0.45)' }}>十二小时制(use12Hours)</div>
        <TimePicker use12Hours format="h:mm:ss A" />
      </div>

      <div>
        <div style={{ marginBottom: 8, color: 'rgba(0,0,0,0.45)' }}>范围(TimePicker.RangePicker)</div>
        <RangePicker />
      </div>

      <div>
        <div style={{ marginBottom: 8, color: 'rgba(0,0,0,0.45)' }}>禁用部分时段</div>
        <TimePicker
          disabledHours={() => [0, 1, 2, 3, 4, 5]}
          disabledMinutes={() => [30, 31, 32, 33, 34, 35]}
        />
      </div>

      <div>
        <div style={{ marginBottom: 8, color: 'rgba(0,0,0,0.45)' }}>步进(分钟 15 / 秒 10)</div>
        <TimePicker minuteStep={15} secondStep={10} />
      </div>
    </Space>
  );
}
