import React, { useContext } from 'react';
import { Observer, observer } from 'mobx-react';
import { pick } from 'lodash';
import dayjs, { type Dayjs } from 'dayjs';
import { DatePicker } from 'antd';
import type { FieldDateItem, FieldDateRangeItem } from '../types';
import TableFilterContext, { SearchBarContext } from '../context';
import useGMLocale from '../../locale-adapter/useGMLocale';
import {
  momentToDayjs,
  dayjsToMoment,
  momentTupleToDayjs,
  dayjsTupleToMoment,
} from '../../compat/dateUtils';

const { RangePicker } = DatePicker;

interface DateFilterProps extends React.HTMLAttributes<HTMLDivElement> {
  field: FieldDateItem;
}

const DateFilter: React.FC<DateFilterProps> = ({ field }) => {
  const store = useContext(TableFilterContext);
  const locale = useGMLocale();
  const tableFilterLocale = locale?.TableFilter as Record<string, string> | undefined;
  const searchBar = useContext(SearchBarContext);
  const calendarDates = React.useRef<[Dayjs | null, Dayjs | null] | null>(null);

  return (
    <Observer>
      {() => {
        if (!field.range) {
          const commonProps = pick(field, ['disabledDate', 'showTime', 'picker', 'allowClear']);
          const value = store.get(field);
          return (
            <DatePicker
              variant="borderless"
              value={(momentToDayjs(value as any) as Dayjs) ?? undefined}
              onChange={(dayjsVal: Dayjs | null) => {
                // 字段类型声明为 Dayjs,但 erp 运行时存 Moment,这里转回 moment(as any 表明刻意桥接)
                store.set(field, (dayjsToMoment(dayjsVal) ?? undefined) as any);
                if (['onChange', 'both'].includes(store.trigger!)) {
                  if (searchBar?.onSearch) {
                    searchBar.onSearch(store.toParams());
                  } else {
                    store.search();
                  }
                }
              }}
              style={{ width: '100%' }}
              onFocus={() => {
                store.focusedFieldKey = field.key;
              }}
              onBlurCapture={() => {
                store.focusedFieldKey = '';
              }}
              {...commonProps}
            />
          );
        }

        const commonProps = pick(field, ['disabledDate', 'showTime', 'allowClear', 'onCalendarChange']);
        const value = store.get(field);
        // 稳定 dayjs value 引用：仅当 moment 值的 timestamp 变化时才重新转换，
        // 避免每次 render 新建 dayjs 数组导致 rc-picker 在选择过程中（如 input blur 触发
        // store.focusedFieldKey 变化引起 re-render）把内部 calendarValue 重置回受控 value，
        // 表现为「单击日期没选上、需要双击」。field.range 对单实例恒定，分支内调用 Hook 安全。
        const dayjsValue = React.useMemo(
          () => (momentTupleToDayjs(value as any) as any) ?? undefined,
          // eslint-disable-next-line react-hooks/exhaustive-deps
          [value?.[0]?.valueOf?.() ?? null, value?.[1]?.valueOf?.() ?? null],
        );
        const defaultRanges: FieldDateRangeItem['ranges'] = {
          [tableFilterLocale?.today || '今天']: [dayjs().startOf('day'), dayjs().endOf('day')],
          [tableFilterLocale?.yesterday || '昨天']: [
            dayjs().subtract(1, 'day').startOf('day'),
            dayjs().subtract(1, 'day').endOf('day'),
          ],
          [tableFilterLocale?.last7days || '近7天']: [
            dayjs().subtract(6, 'day').startOf('day'),
            dayjs().endOf('day'),
          ],
          [tableFilterLocale?.last30Days || '近30天']: [
            dayjs().subtract(29, 'day').startOf('day'),
            dayjs().endOf('day'),
          ],
        };
        return (
          <RangePicker
            variant="borderless"
            ranges={field.ranges ?? defaultRanges}
            value={dayjsValue}
            onChange={(moments: any) => {
              calendarDates.current = moments;
              if (moments?.[1])
                moments[1] = field?.showTime ? moments[1] : moments[1].endOf('day');
              store.set(field, dayjsTupleToMoment(moments) as any);
              if (['onChange', 'both'].includes(store.trigger!)) {
                store.search();
              }
            }}
            style={{ width: '100%' }}
            onFocus={() => {
              store.focusedFieldKey = field.key;
            }}
            onBlurCapture={() => {
              store.focusedFieldKey = '';
            }}
            {...commonProps}
            disabledDate={(date: Dayjs) => {
              return commonProps?.disabledDate?.(date, {
                begin: calendarDates.current?.[0],
                end: calendarDates.current?.[1],
              });
            }}
            onOpenChange={(open: boolean) => {
              if (open) {
                if (field.openClearValues) {
                  calendarDates.current = null;
                  store.set(field, [null, null]);
                }
              }
            }}
            onCalendarChange={(val: any, dateStrings: string[], info: any) => {
              calendarDates.current = val;
              commonProps?.onCalendarChange?.(val, dateStrings, info);
            }}
          />
        );
      }}
    </Observer>
  );
};
export default observer(DateFilter);
