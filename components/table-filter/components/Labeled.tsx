import classNames from 'classnames';
import type { CSSProperties, FC, HTMLAttributes } from 'react';
import React, { useContext } from 'react';
import { observer } from 'mobx-react';
import DateFilter from './DateFilter';
import InputFilter from './InputFilter';
import SelectFilter from './SelectFilter';
import CascaderFilter from './CascaderFilter';
import type { FieldItem } from '../types';
import TableFilterContext from '../context';
import Select from '../../select';

export interface LabeledProps extends HTMLAttributes<HTMLDivElement> {
  fields: FieldItem[];
}

const Labeled: FC<LabeledProps> = ({ style, className, fields }) => {
  const store = useContext(TableFilterContext);
  const groupIndex = store.groups.get(fields[0]?.group || '') || 0;
  const field = fields.length === 1 ? fields[0] : fields[groupIndex!];

  const customStyle: CSSProperties = {
    height: 34,
  };

  switch (field.type) {
    case 'select': {
      if (field.multiple)
        Object.assign(customStyle, {
          maxWidth: field.multiple ? undefined : field.maxWidth,
          height: field.multiple ? 'initial' : undefined,
        });
      break;
    }
    default:
      break;
  }

  return (
    <div
      className={classNames(className, 'labeled', {
        'labeled-focused': store.focusedFieldKey === field.key,
        disabled: field.disabled,
      })}
      style={{ ...customStyle, ...style }}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex, jsx-a11y/tabindex-no-positive
      tabIndex={1}
    >
      <div
        className={classNames({
          'labeled-group': fields.length > 1,
        })}
        style={{
          // 'tw-flex-shrink-0',
          flexShrink: 0,
        }}
      >
        {(() => {
          if (field.hideLabel) return null;
          if (fields.length === 1) {
            return (
              <span
                // className="tw-text-gray-2 tw-text-sm"
                style={{
                  color: '#707070',
                }}
              >
                {field.label}
              </span>
            );
          }
          return (
            <Select
              bordered={false}
              size="small"
              value={groupIndex}
              onChange={value => store.groups.set(field.group || '', value)}
              dropdownMatchSelectWidth={false}
            >
              {fields.map((field, i) => (
                <Select.Option key={field.key} value={i}>
                  <span
                    // className="tw-text-gray-2 tw-text-sm"
                    style={{
                      color: '#707070',
                      fontSize: 14,
                    }}
                  >
                    {field.label}
                  </span>
                </Select.Option>
              ))}
            </Select>
          );
        })()}
      </div>
      <div
        // className={classNames(
        //   'tw-flex tw-items-center tw-flex-grow tw-text-sm tw-text-black tw-overflow-hidden',
        // )}
        style={{
          display: 'flex',
          alignItems: 'center',
          flexGrow: 1,
          fontSize: 14,
          color: '#000',
          overflow: 'hidden',
        }}
      >
        {(() => {
          switch (field.type) {
            case 'input':
              return (
                <InputFilter
                  field={field}
                  // className={classNames({
                  //   'tw--ml-2': field.hideLabel,
                  // })}
                  style={{
                    marginLeft: -10,
                  }}
                />
              );
            case 'select':
              return (
                <SelectFilter
                  field={field}
                  className={classNames({
                    // 'tw-ml-2': !field.hideLabel,
                  })}
                />
              );
            case 'date':
              return <DateFilter field={field} />;
            case 'cascader':
              return (
                <CascaderFilter
                  field={field}
                  className={classNames({
                    // 'tw-ml-2': !field.hideLabel,
                  })}
                />
              );
            default:
              return null;
          }
        })()}
      </div>
    </div>
  );
};

export default observer(Labeled);
