import { applyCompatProps } from '../withCompat';

describe('applyCompatProps', () => {
  it('把 v4 别名改名为 v5(当 v5 缺席时)', () => {
    expect(applyCompatProps({ visible: true }, { rename: { visible: 'open' } })).toEqual({ open: true });
  });

  it('v4 与 v5 同时存在时 v5 胜出,并删除 v4 别名', () => {
    expect(applyCompatProps({ visible: false, open: true }, { rename: { visible: 'open' } })).toEqual({ open: true });
  });

  it('保留无关 props', () => {
    expect(applyCompatProps({ title: 'x', visible: true }, { rename: { visible: 'open' } })).toEqual({ title: 'x', open: true });
  });

  it('rename 后再执行 transform', () => {
    const out = applyCompatProps({ bordered: false }, {
      rename: {},
      transform: (p) => {
        if (p.bordered === false && p.variant === undefined) p.variant = 'borderless';
        delete p.bordered;
        return p;
      },
    });
    expect(out).toEqual({ variant: 'borderless' });
  });

  it('无 rename/transform 时原样返回(浅拷贝)', () => {
    const src = { a: 1 };
    const out = applyCompatProps(src, {});
    expect(out).toEqual({ a: 1 });
    expect(out).not.toBe(src);
  });
});

import { BASE_SELECT_RENAME } from '../withBaseSelectCompat';
import { applyCompatProps as apply } from '../withCompat';

describe('BaseSelect 系改名', () => {
  it('dropdownClassName → popupClassName', () => {
    expect(apply({ dropdownClassName: 'x' }, { rename: BASE_SELECT_RENAME })).toEqual({ popupClassName: 'x' });
  });
  it('dropdownMatchSelectWidth → popupMatchSelectWidth', () => {
    expect(apply({ dropdownMatchSelectWidth: 200 }, { rename: BASE_SELECT_RENAME })).toEqual({ popupMatchSelectWidth: 200 });
  });
  it('dropdownRender → popupRender', () => {
    const fn = () => null;
    expect(apply({ dropdownRender: fn }, { rename: BASE_SELECT_RENAME })).toEqual({ popupRender: fn });
  });
  it('onDropdownVisibleChange → onOpenChange', () => {
    const fn = () => null;
    expect(apply({ onDropdownVisibleChange: fn }, { rename: BASE_SELECT_RENAME })).toEqual({ onOpenChange: fn });
  });
  it('四项同时存在时全部转换', () => {
    expect(
      apply(
        {
          dropdownClassName: 'x',
          dropdownMatchSelectWidth: true,
          dropdownRender: () => null,
          onDropdownVisibleChange: () => null,
          placeholder: 'p',
        },
        { rename: BASE_SELECT_RENAME },
      ),
    ).toMatchObject({
      popupClassName: 'x',
      popupMatchSelectWidth: true,
      popupRender: expect.any(Function),
      onOpenChange: expect.any(Function),
      placeholder: 'p',
    });
  });
});
