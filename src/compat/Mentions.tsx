import React from 'react';
import { Mentions as AntMentions } from 'antd';
import { withBaseSelectCompat } from './withBaseSelectCompat';

// 用 ComponentProps 提取具体 props, 避免 antd5 MentionsProps(extends MentionProps extends Omit<RcMentionsProps>)
// 的深层继承链导致 tsup 的 rollup-plugin-dts 解析失败报 TS2724(rollup-plugin-dts bug, 标准 tsc 正常)
export type MentionsProps = React.ComponentProps<typeof AntMentions>;

const Compat = withBaseSelectCompat(AntMentions as React.ComponentType<MentionsProps>);
(Compat as any).Option = AntMentions.Option;
(Compat as any).getMentions = AntMentions.getMentions;

export default Compat as typeof Compat & {
  Option: typeof AntMentions.Option;
  getMentions: typeof AntMentions.getMentions;
};
