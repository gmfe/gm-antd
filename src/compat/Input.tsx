import React from 'react';
import { Input as AntInput } from 'antd';
import type { InputProps as AntInputProps } from 'antd';
import { applyCompatProps } from './withCompat';
import { transformBordered } from './withBaseSelectCompat';

export type InputProps = AntInputProps;

const Input = React.forwardRef<any, InputProps>((props, ref) => (
  <AntInput ref={ref} {...applyCompatProps(props as Record<string, any>, { transform: transformBordered })} />
));

(Input as any).displayName = 'GmInput';
// 保留 antd Input 静态成员,业务 Input.TextArea 等用法零改动
(Input as any).TextArea = AntInput.TextArea;
(Input as any).Search = AntInput.Search;
(Input as any).Password = AntInput.Password;
(Input as any).Group = AntInput.Group;

export default Input as typeof Input & {
  TextArea: typeof AntInput.TextArea;
  Search: typeof AntInput.Search;
  Password: typeof AntInput.Password;
  Group: typeof AntInput.Group;
};
