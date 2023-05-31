---
order: 7
title:
  zh-CN: 自定义组件
  en-US: TODO
gm: true
---

## zh-CN
你完全可以自定义组件，看下面的例子

## en-US

TODO

```tsx
import { TableFilter, message, Input, Select, TableFilterContext } from 'antd';
import type { FieldItem } from 'antd';
import React, { useContext, useState, useRef, useCallback } from 'react';
import { usePagination } from '@gm-common/hooks';
import moment from 'moment'
import { debounce } from 'lodash'
import { useTimeoutFn } from 'react-use';

interface CustomerInputProps {
  field: FieldItem
}

/**
 * 简易debounce, 用ahook? 或者react-use 的useDebounce
 */
function useDebounce(fn:() => any, delay:Number = 100) {
    const ref = useRef(fn)
    const debounceFn = useRef<ReturnType<typeof setTimeout>>(null)
    ref.current = fn
  
    return useCallback(function f(...args) {
      if (debounceFn.current) {
        clearTimeout(debounceFn.current);
      }
      debounceFn.current = setTimeout(() => {
        ref.current.call(this, ...args);
      }, delay || 100);
    }, [])
}

const CustomerInput = (props: CustomerInputProps) => {
  const { field } = props
  const store = useContext(TableFilterContext);
  const [innerValue, setInnerValue] = useState(() => store.get(field))
  const focusRef = useRef(false)

  const debounced = useDebounce(store.search, 500)

  const handleChange = (keyName: string,val: string) => {
    const newValue = {
      ...innerValue,
      [keyName]: val
    }
    setInnerValue(newValue)
    store.set(field.key, newValue)
    debounced()
  }

  const options = [
    {
      label: '选项一',
      value: '1'
    },
    {
      label: '选项二',
      value: '2'
    }
  ]

  /** 
   * 这里举个例子 失去焦点时请求，
   * 当然了，你完全可以在onChange 时使用react-use useDebounce 监听innerValue 后再做搜索
   */
  const handleBlur = () => {
    if (!focusRef.current) {
      return
    }
    try {
      message.info('失去焦点时触发')
      if (['onChange', 'both'].includes(store.trigger!)) {
        store.search()
      }
    } finally {
      focusRef.current = false
    }
  }

  return (
    <div 
      onBlur={handleBlur}
      onFocus={() => focusRef.current = true }
      style={{
        display: 'flex', 
        flexDirection: 'row', 
        border: '1px solid #d6d6d6',
        borderRadius: '4px'
      }}
    >
      <Select 
        value={innerValue.select}
        options={options} 
        bordered={false} 
        placeholder='请选择' 
        onChange={(val) => handleChange('type', val)}
      />
      <div 
        style={{borderLeft: '1px solid #d6d6d6'}}
      >
        <Input 
          value={innerValue.input}
          bordered={false} 
          placeholder='请输入' 
          onChange={(e) => handleChange('input', e.target.value)}
        />
      </div>
    </div>
  )
}

const App: React.FC = () => {
  const paginationResult = usePagination(async params => message.info(JSON.stringify(params, undefined, 2)), {
    defaultPaging: {
      limit: 999,
    },
  });

  const fields: FieldItem[] = [
    {
      key: 'customer_render',
      type: 'input',
      alwaysUsed: true,
      defaultValue: {
        select: '1',
        input: '哈哈哈'
      },
      label: '科目代码/名称',
      render: (
        <CustomerInput />
      ),
      toParam: (value) => {
        return {
          selectData: value.select,
          inputData: value.input
        }
      }
    },
  ]

  const onCustomSave = () => {
    message.success('保存成功， 重新执行搜索接口',)
    const handler = TableFilter.get('custom-tableFilter')
    handler.search()
    // paginationResult.run()
  }

  return (
    <>
      <TableFilter 
        trigger='both'
        id='custom-tableFilter'
        paginationResult={paginationResult}
        fields={fields}
        isExpanded
        isAlwaysShowCustom
        skipInitialValues={['date']}
        onCustomSave={onCustomSave}
      />
    </>
  );
};

export default App;

```
