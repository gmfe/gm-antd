import classNames from 'classnames';
import React, { useContext } from 'react';
import { observer } from 'mobx-react';
import { Select } from 'antd';
import DateFilter from './DateFilter';
import InputFilter from './InputFilter';
import SelectFilter from './SelectFilter';
import CascaderFilter from './CascaderFilter';
import type { FieldItem } from '../types';
import TableFilterContext from '../context';

interface LabeledProps extends React.HTMLAttributes<HTMLDivElement> {
  fields: FieldItem[];
}

const Labeled: React.FC<LabeledProps> = ({ style, className, fields }) => {
  const store = useContext(TableFilterContext);
  const groupIndex = store.groups.get(fields[0]?.group || '') || 0;
  const field = fields.length === 1 ? fields[0] : fields[groupIndex!];

  const customStyle: React.CSSProperties = { height: 34 };

  if (field.type === 'select' && field.multiple) {
    Object.assign(customStyle, {
      maxWidth: field.multiple ? undefined : field.maxWidth,
      height: field.multiple ? 'initial' : undefined,
    });
  }

  return (
    <div
      className={classNames(className, 'labeled', {
        'labeled-focused': store.focusedFieldKey === field.key,
        disabled: field.disabled,
      })}
      style={{ ...customStyle, ...style }}
      tabIndex={1}
    >
      <div
        className={classNames({
          'labeled-group': fields.length > 1,
        })}
        style={{ flexShrink: 0 }}
      >
        {(() => {
          if (field.hideLabel) return null;
          if (fields.length === 1) {
            return (
              <span style={{ color: '#707070', fontSize: 14 }}>
                {field.label}
              </span>
            );
          }
          return (
            <Select
              variant="borderless"
              size="small"
              value={groupIndex}
              onChange={value => store.groups.set(field.group || '', value)}
              popupMatchSelectWidth={false}
            >
              {fields.map((f, i) => (
                <Select.Option key={f.key} value={i}>
                  <span style={{ color: '#707070', fontSize: 14 }}>{f.label}</span>
                </Select.Option>
              ))}
            </Select>
          );
        })()}
      </div>
      <div
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
              return <InputFilter field={field} style={{ marginLeft: -10 }} />;
            case 'select':
              return <SelectFilter field={field} />;
            case 'date':
              return <DateFilter field={field} />;
            case 'cascader':
              return <CascaderFilter field={field} />;
            default:
              return null;
          }
        })()}
      </div>
    </div>
  );
};

export default observer(Labeled);
