import type { FC, HTMLAttributes } from 'react';
import React, { useContext } from 'react';
import { Observer, observer } from 'mobx-react';
import { pick } from 'lodash';
import moment from 'moment';
import type { FieldDateItem, FieldDateRangeItem } from '../types';
import TableFilterContext, { SearchBarContext } from '../context';
import DatePicker from '../../date-picker';
import { useLocaleReceiver } from '../../locale-provider/LocaleReceiver';

const { RangePicker } = DatePicker;

export interface DateFilterProps extends HTMLAttributes<HTMLDivElement> {
  field: FieldDateItem;
}

const DateFilter: FC<DateFilterProps> = ({ field }) => {
  const store = useContext(TableFilterContext);
  const [tableFilterLocale] = useLocaleReceiver('TableFilter');
  const searchBar = useContext(SearchBarContext)

  return (
    <Observer>
      {() => {
        if (!field.range) {
          const commonProps = pick(field, ['disabledDate', 'showTime', 'picker', 'allowClear']);
          // 单日选择, 缺少使用场景，有需要再完善
          const value = store.get(field);
          return (
            <DatePicker
              bordered={false}
              value={value!}
              onChange={moment => {
                store.set(field, moment!);
                if (['onChange', 'both'].includes(store.trigger!)) {
                  if (searchBar?.onSearch) {
                    searchBar.onSearch(store.toParams())
                  } else {
                    store.search();
                  }
                }
              }}
              style={{ width: '100%' }}
              onFocus={() => {
                store.focusedFieldKey = field.key;
              }}
              // @ts-ignore
              onBlurCapture={() => {
                store.focusedFieldKey = '';
              }}
              {...commonProps}
            />
          );
        }
        const commonProps = pick(field, ['disabledDate', 'showTime', 'allowClear']);
        const defaultRanges: FieldDateRangeItem['ranges'] = {
          [tableFilterLocale?.today || '']: [moment().startOf('day'), moment().endOf('day')],
          [tableFilterLocale?.yesterday || '']: [
            moment().subtract(1, 'day').startOf('day'),
            moment().subtract(1, 'day').endOf('day'),
          ],
          [tableFilterLocale?.last7days || '']: [
            moment().subtract(6, 'day').startOf('day'),
            moment().endOf('day'),
          ],
          [tableFilterLocale?.last30Days || '']: [
            moment().subtract(29, 'day').startOf('day'),
            moment().endOf('day'),
          ],
        };
        // 日期范围选择
        const value = store.get(field);
        return (
          <RangePicker
            bordered={false}
            ranges={field.ranges ?? defaultRanges}
            value={value!}
            onChange={moments => {
              if (moments?.[1]) moments[1] = moments[1].endOf('day');
              store.set(field, moments);
              if (['onChange', 'both'].includes(store.trigger!)) {
                store.search();
              }
            }}
            style={{ width: '100%' }}
            onFocus={() => {
              store.focusedFieldKey = field.key;
            }}
            // @ts-ignore
            onBlurCapture={() => {
              store.focusedFieldKey = '';
            }}
            {...commonProps}
          />
        );
      }}
    </Observer>
  );
};
export default observer(DateFilter);
