import React from 'react';
import { InputNumber as AntInputNumber } from 'antd';
import type { InputNumberProps as AntInputNumberProps } from 'antd';
import { applyCompatProps } from './withCompat';
import { transformBordered } from './withBaseSelectCompat';

export type InputNumberProps = AntInputNumberProps;

const InputNumber = React.forwardRef<any, InputNumberProps>((props, ref) => (
  <AntInputNumber ref={ref} {...applyCompatProps(props as Record<string, any>, { transform: transformBordered })} />
));

(InputNumber as any).displayName = 'GmInputNumber';

export default InputNumber;
