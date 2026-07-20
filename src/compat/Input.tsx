import React from 'react';
import { Input as AntInput, Space } from 'antd';
import type { InputProps as AntInputProps } from 'antd';
import { applyCompatProps } from './withCompat';
import { transformBordered } from './withBaseSelectCompat';

export type InputProps = AntInputProps;

const Input = React.forwardRef<any, InputProps>((props, ref) => (
  <AntInput ref={ref} {...applyCompatProps(props as Record<string, any>, { transform: transformBordered })} />
));

const Compact = Space.Compact as any;

(Input as any).displayName = 'GmInput';
// antd5: TextArea/Search/Password 仍导出(直接拷); Group 移除, 映射到 Space.Compact。
(Input as any).TextArea = AntInput.TextArea;
(Input as any).Search = AntInput.Search;
(Input as any).Password = AntInput.Password;
const Group = React.forwardRef<HTMLDivElement, React.ComponentProps<typeof Space.Compact> & { compact?: boolean }>(
  ({ compact, ...rest }, ref) => <Compact ref={ref} {...rest} />,
);
Group.displayName = 'Group';
(Input as any).Group = Group;

export default Input as any;
