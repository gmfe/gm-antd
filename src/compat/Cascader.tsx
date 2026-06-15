import React from 'react';
import { Cascader as AntCascader } from 'antd';
import { withBaseSelectCompat } from './withBaseSelectCompat';

// 用 ComponentProps 提取实例化后的具体 props 类型, 避免 antd5 CascaderProps 的 3 个泛型
// 导致 tsup 的 rollup-plugin-dts 打包时报 "Generic type requires type argument"
export type CascaderProps = React.ComponentProps<typeof AntCascader>;

export default withBaseSelectCompat(AntCascader as React.ComponentType<CascaderProps>);
