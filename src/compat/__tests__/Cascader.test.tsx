import Cascader from '../Cascader';

jest.mock('antd', () => {
  // eslint-disable-next-line global-require
  const ReactModule = require('react');
  const CascaderMock = ReactModule.forwardRef(() => null);
  CascaderMock.SHOW_PARENT = 'SHOW_PARENT';
  CascaderMock.SHOW_CHILD = 'SHOW_CHILD';
  return {
    Cascader: CascaderMock,
  };
});

describe('CompatCascader', () => {
  it('保留勾选策略静态属性', () => {
    expect(Cascader.SHOW_PARENT).toBe('SHOW_PARENT');
    expect(Cascader.SHOW_CHILD).toBe('SHOW_CHILD');
  });
});
