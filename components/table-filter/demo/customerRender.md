---
order: 7
title:
  zh-CN: 自定义组件
  en-US: TODO
gm: true
---

## zh-CN
你完全可以自定义组件，看下面的例子, field 中使用`render` 自定义组件，自定义组件 看`CustomerInput`,
另外你可以增加`isSaveOptions` 属性，避免每次 展开收起都进行获取`options` 的请求, 注意下面的`jsonp`, 可以看到展开收起并没有再次请求

## en-US

TODO

```tsx
import { TableFilter, message, Input, Select, TableFilterContext } from 'antd';
import type { FieldItem } from 'antd';
import React, { useContext, useState, useRef, useCallback } from 'react';
import { usePagination } from '@gm-common/hooks';
import moment from 'moment'
import { debounce } from 'lodash'
import jsonp from 'fetch-jsonp';
import qs from 'qs';

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
        debounced()
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
        style={{borderLeft: '1px solid #d6d6d6', flex: 1}}
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
      label: '自定义组件',
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
    {
      key: 'select',
      type: 'select',
      alwaysUsed: true,
      label: '科目代码/名称',
      allowClear: false,
      options: [{
        label: '选项1',
        value: 1
      }],
    },
    {
      key: 'select1',
      type: 'select',
      alwaysUsed: false,
      label: '科目代码/名称123',
      allowClear: false,
      defaultUsed: true,
      options: async () => {
        const str = qs.stringify({
          code: 'utf-8',
          q: '14',
        });
        const res = await jsonp(`https://suggest.taobao.com/sug?${str}`)
        const data = await res.json()
        const options = data.result.map((_item) => {
          return {
            value: `${_item[0]}`,
            label: `${_item[0]}`
          }
        })
        return options
      },
      collapsed: true,
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
        isSaveOptions
        isAlwaysShowCustom
        skipInitialValues={['date']}
        onCustomSave={onCustomSave}
      />
    </>
  );
};

export default App;

```
