import classNames from 'classnames';
import type { HTMLAttributes, ReactNode } from 'react';
import React from 'react';

export interface InfoFieldProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode;
  value: ReactNode;
}

const InfoField: React.FC<InfoFieldProps> = ({ className, style, label, value }) => (
  <div className={classNames(className)} style={{ ...style, fontSize: 14 }}>
    <span style={{ marginRight: 10, color: 'black', fontWeight: 'bold' }}>
      {label}
    </span>
    <span style={{ color: 'var(--ant-color-primary)' }}>
      {value}
    </span>
  </div>
);

export default InfoField;
