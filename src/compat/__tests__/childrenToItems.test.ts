import React from 'react';
import { tabChildrenToItems, menuChildrenToItems } from '../childrenToItems';

const REACT_ELEMENT_TYPE = Symbol.for('react.element');

/**
 * 构造一个合法的 React 元素(带 $$typeof 标记),type 为带 displayName 的 mock,
 * 以模拟 <Tabs.TabPane>/<Menu.Item>/<Menu.SubMenu>。
 * 说明:React.Children.toArray 会给 key 加 ".$" 前缀(框架行为),因此断言中的 key 需用 toArrayKey() 还原。
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

/** 还原 React.Children.toArray 后的 key:toArray 把 "a" 变成 ".$a"。 */
function toArrayKey(key: string): string {
  return '.$' + key;
}

describe('tabChildrenToItems', () => {
  it('把 TabPane children 转成 items(tab→label, children→children)', () => {
    const items = tabChildrenToItems([mockElem('TabPane', 'a', { tab: 'A', children: 'a-content' })]);
    expect(items).toEqual([{ key: toArrayKey('a'), label: 'A', children: 'a-content' }]);
  });

  it('已是 items 数组(无 TabPane 元素)时返回 undefined,交还 antd 处理', () => {
    const items = tabChildrenToItems([React.createElement('div', null, 'x')]);
    expect(items).toBeUndefined();
  });

  it('null/空 children 返回 undefined', () => {
    expect(tabChildrenToItems(null)).toBeUndefined();
    expect(tabChildrenToItems([])).toBeUndefined();
  });
});

describe('menuChildrenToItems', () => {
  it('Menu.Item(key+children)→ leaf {key,label}', () => {
    const items = menuChildrenToItems([mockElem('MenuItem', '1', { children: 'One' })]);
    expect(items).toEqual([{ key: toArrayKey('1'), label: 'One' }]);
  });

  it('Menu.SubMenu(title+children)→ {key,label,children:[...]}', () => {
    const items = menuChildrenToItems([
      mockElem('SubMenu', 'g1', {
        title: 'Group',
        children: [mockElem('MenuItem', '1', { children: 'One' })],
      }),
    ]);
    expect(items).toEqual([
      { key: toArrayKey('g1'), label: 'Group', children: [{ key: toArrayKey('1'), label: 'One' }] },
    ]);
  });

  it('普通元素(非 Menu 系列)返回 undefined', () => {
    expect(menuChildrenToItems([React.createElement('div', null, 'x')])).toBeUndefined();
  });
});
