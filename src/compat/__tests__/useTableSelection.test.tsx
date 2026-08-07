import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import useTableSelection from '../../table/hooks/useTableSelection';

jest.mock('../../locale-adapter/useGMLocale', () => () => ({ Table: {} }));

describe('useTableSelection', () => {
  it('允许单独勾选未禁用的行', () => {
    const record = { order_id: 'order-1' };
    let selectedRowKeys: Array<string | number> = [];

    const Harness = () => {
      const result = useTableSelection({
        dataSource: [record],
        keyName: 'order_id',
        rowSelection: {},
      });
      selectedRowKeys = result.selectedRowKeys;

      return (
        <button type="button" onClick={() => result.controller.toggle(record)}>
          勾选订单
        </button>
      );
    };

    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: '勾选订单' }));

    expect(selectedRowKeys).toEqual(['order-1']);
  });
});
