import classNames from 'classnames';
import type { FC, HTMLAttributes, ReactNode } from 'react';
import React from 'react';

export interface InfoFieldProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode;
  value: ReactNode;
}

/** Styled component */
const InfoField: FC<InfoFieldProps> = ({ className, style, label, value }) => (
  <div className={classNames(className)} style={{ ...style, fontSize: 14 }}>
    <span
      // className="tw-mr-2 tw-text-black tw-font-family-medium tw-font-medium"
      style={{
        marginRight: 10,
        color: 'black',
        fontFamily: 'bold',
      }}
    >
      {label}
    </span>
    <span
      // className="tw-text-blue"
      style={{ color: 'var(--ant-primary-color)' }}
    >
      {value}
    </span>
  </div>
);
export default InfoField;
