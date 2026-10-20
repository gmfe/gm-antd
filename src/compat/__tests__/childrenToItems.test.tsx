import React from 'react';
import { tabChildrenToItems, menuChildrenToItems } from '../childrenToItems';

const REACT_ELEMENT_TYPE = Symbol.for('react.element');

/**
 * 构造一个合法的 React 元素(带 $$typeof 标记),type 为带 displayName 的 mock,
 * 以模拟 <Tabs.TabPane>/<Menu.Item>/<Menu.SubMenu>。
 * 说明:collectChildren 用 React.Children.forEach 展开且不改写 key,
 * 因此断言中的 key 与 mockElem 传入的原始 key 一致(无 ".$" 前缀)。
 */
function mockElem(displayName: string, key: string, props: any): React.ReactElement {
  return {
    $$typeof: REACT_ELEMENT_TYPE,
    type: { displayName },
    key,
    ref: null,
    props,
    _owner: null,
    _store: { validated: true },
  } as unknown as React.ReactElement;
}

describe('tabChildrenToItems', () => {
  it('把 TabPane children 转成 items(tab→label, children→children)', () => {
    const items = tabChildrenToItems([mockElem('TabPane', 'a', { tab: 'A', children: 'a-content' })]);
    expect(items).toEqual([{ key: 'a', label: 'A', children: 'a-content' }]);
  });

  it('已是 items 数组(无 TabPane 元素)时返回 undefined,交还 antd 处理', () => {
    const items = tabChildrenToItems([React.createElement('div', null, 'x')]);
    expect(items).toBeUndefined();
  });

  it('null/空 children 返回 undefined', () => {
    expect(tabChildrenToItems(null)).toBeUndefined();
    expect(tabChildrenToItems([])).toBeUndefined();
  });

  it('Fragment 包裹的 TabPane 被展开,key 不改写', () => {
    const items = tabChildrenToItems([
      mockElem('TabPane', '1', { tab: '商品明细', children: 'A' }),
      true && (
        <>
          {mockElem('TabPane', '2', { tab: '费用分摊', children: 'B' })}
          {mockElem('TabPane', '3', { tab: '金额折让', children: 'C' })}
        </>
      ),
    ]);
    expect(items).toEqual([
      { key: '1', label: '商品明细', children: 'A' },
      { key: '2', label: '费用分摊', children: 'B' },
      { key: '3', label: '金额折让', children: 'C' },
    ]);
  });

  it('嵌套 Fragment 也被展开', () => {
    const items = tabChildrenToItems([
      <>
        <>{mockElem('TabPane', 'a', { tab: 'A', children: 'a' })}</>
        {mockElem('TabPane', 'b', { tab: 'B', children: 'b' })}
      </>,
    ]);
    expect(items).toEqual([
      { key: 'a', label: 'A', children: 'a' },
      { key: 'b', label: 'B', children: 'b' },
    ]);
  });

  it('条件为 false 时 Fragment 整体被过滤', () => {
    const items = tabChildrenToItems([
      mockElem('TabPane', '1', { tab: 'A', children: 'a' }),
      false && <>{mockElem('TabPane', '2', { tab: 'B', children: 'b' })}</>,
    ]);
    expect(items).toEqual([{ key: '1', label: 'A', children: 'a' }]);
  });
});

describe('menuChildrenToItems', () => {
  it('Menu.Item(key+children)→ leaf {key,label}', () => {
    const items = menuChildrenToItems([mockElem('MenuItem', '1', { children: 'One' })]);
    expect(items).toEqual([{ key: '1', label: 'One' }]);
  });

  it('Menu.SubMenu(title+children)→ {key,label,children:[...]}', () => {
    const items = menuChildrenToItems([
      mockElem('SubMenu', 'g1', {
        title: 'Group',
        children: [mockElem('MenuItem', '1', { children: 'One' })],
      }),
    ]);
    expect(items).toEqual([{ key: 'g1', label: 'Group', children: [{ key: '1', label: 'One' }] }]);
  });

  it('Fragment 包裹的 Menu.Item 被展开', () => {
    const items = menuChildrenToItems([
      <>{mockElem('MenuItem', '1', { children: 'One' })}</>,
      mockElem('MenuItem', '2', { children: 'Two' }),
    ]);
    expect(items).toEqual([
      { key: '1', label: 'One' },
      { key: '2', label: 'Two' },
    ]);
  });

  it('普通元素(非 Menu 系列)返回 undefined', () => {
    expect(menuChildrenToItems([React.createElement('div', null, 'x')])).toBeUndefined();
  });
});
